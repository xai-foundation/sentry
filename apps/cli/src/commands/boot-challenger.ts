import { Command } from 'commander';
import inquirer from 'inquirer';
import axios from 'axios';
import { ethers } from 'ethers';
import { 
    config, 
    createBlsKeyPair, 
    getAssertion, 
    getSignerFromPrivateKey, 
    listenForAssertions, 
    submitAssertionToReferee, 
    EventListenerError, 
    findMissedAssertion, 
    isAssertionSubmitted 
} from '@sentry/core';

const NUM_ASSERTION_LISTENER_RETRIES = 3;
const NUM_CON_WS_ALLOWED_ERRORS = 10;
const ASSERTION_LISTENER_RETRY_DELAYS: [number, number, number] = [30000, 180000, 600000];
const BACKUP_SUBMISSION_DELAY = 300000;

let cachedSigner: { address: string; signer: ethers.Signer } | undefined;
let cachedWebhookUrl: string | undefined;
let cachedSecretKey: string;
let lastAssertionTime: number = Date.now();
let currentNumberOfRetries = 0;
let CHALLENGER_INSTANCE = 1;
let isProcessingMissedAssertions = false;

/**
 * Function to boot the challenger and listen for assertions.
 * @param cli - Commander instance
 */
export function bootChallenger(cli: Command) {
    cli
        .command('boot-challenger')
        .description('Starts a runtime of the challenger.')
        .action(async () => {
            if (!cachedSigner || !cachedSecretKey) {
                await initializeChallenger();
            }

            process.on('SIGINT', handleProcessTermination);

            const assertionCheckInterval = setInterval(() => {
                checkTimeSinceLastAssertion();
            }, 5 * 60 * 1000);

            for (; currentNumberOfRetries <= NUM_ASSERTION_LISTENER_RETRIES; currentNumberOfRetries++) {
                try {
                    isProcessingMissedAssertions = false;
                    await processMissedAssertions();
                } catch (error) {
                    console.error(`Failed to handle missed assertions - ${(error as Error).message}`);
                    await sendNotification(`Failed to handle missed assertions - ${(error as Error).message}`);
                }

                console.log(`The challenger is now listening for assertions...`);
                await startListener();

                if (currentNumberOfRetries + 1 <= NUM_ASSERTION_LISTENER_RETRIES) {
                    const delayPerRetry = ASSERTION_LISTENER_RETRY_DELAYS[currentNumberOfRetries];
                    console.log(`Challenger restarting after ${delayPerRetry / 1000} seconds`);
                    await sendNotification(`Challenger restarting after ${delayPerRetry / 1000} seconds`);

                    await new Promise(resolve => setTimeout(resolve, delayPerRetry));
                    console.log(`Challenger restarting with ${NUM_ASSERTION_LISTENER_RETRIES - (currentNumberOfRetries + 1)} attempts left.`);
                }
            }

            clearInterval((assertionCheckInterval as any).id);
            console.log(`Challenger has stopped after ${NUM_ASSERTION_LISTENER_RETRIES} attempts.`);
            await sendNotification(`Challenger has stopped after ${NUM_ASSERTION_LISTENER_RETRIES} attempts.`);
        });
}

async function initializeChallenger() {
    const { secretKey } = await inquirer.prompt({
        type: 'password',
        name: 'secretKey',
        message: 'Enter the secret key of the challenger:',
        mask: '*'
    });

    if (!secretKey) throw new Error('No secret key provided.');

    cachedSecretKey = secretKey;
    const { publicKeyHex } = await createBlsKeyPair(secretKey);
    console.log(`Public Key of the Challenger: ${publicKeyHex}`);

    const { walletKey } = await inquirer.prompt({
        type: 'password',
        name: 'walletKey',
        message: 'Enter the private key of the wallet:',
        mask: '*'
    });

    const { address, signer } = getSignerFromPrivateKey(walletKey);
    cachedSigner = { address, signer };
    console.log(`Address of the Wallet: ${address}`);

    const { webhookUrl } = await inquirer.prompt({
        type: 'input',
        name: 'webhookUrl',
        message: 'Enter the webhook URL (optional):'
    });

    cachedWebhookUrl = webhookUrl;

    const { instance } = await inquirer.prompt({
        type: 'input',
        name: 'instance',
        default: "1",
        message: 'Enter the number of challenger instances:'
    });

    CHALLENGER_INSTANCE = Number(instance);

    sendNotification(`Challenger instance ${CHALLENGER_INSTANCE} has started.`);
}

function handleProcessTermination() {
    console.log('The challenger has been terminated manually.');
    sendNotification('The challenger has been terminated manually.');
    process.exit();
}

async function checkTimeSinceLastAssertion() {
    const currentTime = Date.now();
    console.log(`The current time is ${currentTime}`);

    let criticalAmount = 70 * 60 * 1000;
    if (CHALLENGER_INSTANCE !== 1) {
        criticalAmount += CHALLENGER_INSTANCE * 60 * 1000;
    }

    if (currentTime - lastAssertionTime > criticalAmount) {
        let missedAssertion;
        try {
            missedAssertion = await findMissedAssertion();
        } catch (error) {
            commandInstance.log(`[${new Date().toISOString()}] Failed to findMissedAssertion (${error}).`);
            sendNotification(`Error: Challenger instance ${CHALLENGER_INSTANCE} failed to findMissedAssertion`, commandInstance);
        }

        const timeSinceLastAssertion = Math.round((currentTime - lastAssertionTime) / 60000);
        commandInstance.log(`[${new Date().toISOString()}] It has been ${timeSinceLastAssertion} minutes since the last assertion. Please check the Rollup Protocol (https://arbiscan.io/address/${config.rollupAddress}).`);
        if (missedAssertion !== null) {
            commandInstance.log(`[${new Date().toISOString()}] Found NodeConfirm event that has not been posted: AssertionId: ${missedAssertion}`);
            sendNotification(`It has been ${timeSinceLastAssertion} minutes since the last assertion - **A NODE CONFIRM EVENT HAS NOT BEEN SUBMITTED FOR CHALLENGE (Assertion: ${missedAssertion}) !**. Please check the challenger runtime and the RPC (${config.arbitrumOneWebSocketUrl})`, commandInstance);
        } else {
            sendNotification(`It has been ${timeSinceLastAssertion} minutes since the last assertion - No NodeConfirm events have been missed. Please check the Rollup Protocol (https://arbiscan.io/address/${config.rollupAddress}).`, commandInstance);
        }
    }
}

async function sendNotification(message: string) {
    if (cachedWebhookUrl) {
        try {
          
            await axios.post(cachedWebhookUrl, { text: `<!channel> [Instance ${CHALLENGER_INSTANCE}]: ${message}`, unfurl_links: false, });

        } catch (error) {
            console.error(`Failed to send notification: ${(error as Error).message}`);
        }
    }
}

async function startListener() {
    let errorCount = 0;

    return new Promise((resolve) => {
        const listener = listenForAssertions(
            async (nodeNum: any) => {
                try {
                    await onAssertionConfirmedCb(nodeNum);
                    currentNumberOfRetries = 0;
                } catch {
                    listener.stop();
                    resolve(null);
                }
            },
            (v: string) => console.log(v)
        );
    });
}

async function onAssertionConfirmedCb(nodeNum: any) {
    console.log(`Assertion confirmed: ${nodeNum}.`);
    const assertionNode = await getAssertion(nodeNum);
    console.log(`Assertion data retrieved. Starting submission process...`);
    try {
        await submitAssertionToReferee(cachedSecretKey, nodeNum, assertionNode, cachedSigner!.signer);
        console.log(`Submitted assertion: ${nodeNum}`);
        lastAssertionTime = Date.now();
    } catch (error) {
        console.error(`Submit Assertion Error: ${(error as Error).message}`);
        sendNotification(`Submit Assertion Error: ${(error as Error).message}`);
        throw error;
    }
}

async function processMissedAssertions() {
    if (isProcessingMissedAssertions) return;

    console.log(`Looking for missed assertions...`);
    isProcessingMissedAssertions = true;

    try {
        missedAssertionNodeNum = await findMissedAssertion();
    } catch (error: any) {
        commandInstance.log(`[${new Date().toISOString()}] Error looking for missed assertion: ${error}`);
        sendNotification(`Error looking for missed assertion ${error && error.message ? error.message : error}`, commandInstance);
    }

    if (missedAssertionNodeNum) {
        try {
            commandInstance.log(`[${new Date().toISOString()}] Found missed assertion with nodeNum: ${missedAssertionNodeNum}. Looking up the assertion information...`);
            const assertionNode = await getAssertion(missedAssertionNodeNum);
            commandInstance.log(`[${new Date().toISOString()}] Missed assertion data retrieved. Starting the submission process...`);

            await submitAssertionToReferee(
                cachedSecretKey,
                missedAssertionNodeNum,
                assertionNode,
                cachedSigner!.signer,
            );
            commandInstance.log(`[${new Date().toISOString()}] Submitted assertion: ${missedAssertionNodeNum}`);
            lastAssertionTime = Date.now();

        console.log(`Found missed assertion: ${missedAssertionNodeNum}. Retrieving data...`);
        const assertionNode = await getAssertion(missedAssertionNodeNum);
        console.log(`Missed assertion data retrieved. Starting submission process...`);

        await submitAssertionToReferee(cachedSecretKey, missedAssertionNodeNum, assertionNode, cachedSigner!.signer);
        console.log(`Submitted missed assertion: ${missedAssertionNodeNum}`);
    } catch (error) {
        console.error(`Error processing missed assertions: ${(error as Error).message}`);
        sendNotification(`Error processing missed assertions: ${(error as Error).message}`);
    } finally {
        isProcessingMissedAssertions = false;
    }
}
