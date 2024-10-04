import { Command } from 'commander';
import inquirer, { QuestionCollection } from 'inquirer';
import axios from "axios";
import { ethers, Signer } from 'ethers';
import { config, createBlsKeyPair, getAssertion, getSignerFromPrivateKey, listenForAssertions, submitAssertionToReferee, EventListenerError, findMissedAssertion, isAssertionSubmitted } from "@sentry/core";

type PromptBodyKey = "secretKeyPrompt" | "walletKeyPrompt" | "webhookUrlPrompt" | "instancePrompt";

const INIT_PROMPTS: { [key in PromptBodyKey]: QuestionCollection  } = {
    secretKeyPrompt: {
        type: 'password',
        name: 'secretKey',
        message: 'Enter the secret key of the challenger (You can run \'create-bls-key-pair\' to create this key):',
        mask: '*'
    },
    walletKeyPrompt: {
        type: 'password',
        name: 'walletKey',
        message: 'Enter the private key of the wallet that the challenger wants to use:',
        mask: '*'
    },
    webhookUrlPrompt: {
        type: 'input',
        name: 'webhookUrl',
        message: 'Enter the webhook URL if you want to post errors (optional):',
    },
    instancePrompt: {
        type: 'input',
        name: 'instance',
        default: "1",
        message: 'Enter the number of challenger instance this is (default 1 for main instance):',
    }
}

const NUM_ASSERTION_LISTENER_RETRIES: number = 3 as const; //The number of restart attempts if the listener errors
const NUM_CON_WS_ALLOWED_ERRORS: number = 10; //The number of consecutive WS error we allow before restarting the listener
//@dev This has to match NUM_ASSERTION_LISTENER_RETRIES
const ASSERTION_LISTENER_RETRY_DELAYS: [number, number, number] = [30_000, 180_000, 600_000]; //Delays for auto restart the challenger, on the first error it will wait 30 seconds, then 3 minutes then 10 minutes before trying to restart.

let cachedSigner: {
    address: string,
    signer: ethers.Signer
};
let cachedWebhookUrl: string | undefined;
let cachedSecretKey: string;
let lastAssertionTime: number;

let currentNumberOfRetries = 0;

let CHALLENGER_INSTANCE = 1;
const BACKUP_SUBMISSION_DELAY = 300_000; // For every instance we wait 5 minutes + instance number;

let isProcessingMissedAssertions = false;

const initCli = async () => {
    const { secretKey } = await inquirer.prompt([INIT_PROMPTS["secretKeyPrompt"]]);
    if (!secretKey || secretKey.length < 1) {
        throw new Error("No secret key passed in. Please generate one with  'create-bls-key-pair'.")
    }

    cachedSecretKey = secretKey;
    const { publicKeyHex } = await createBlsKeyPair(cachedSecretKey);
    if (!publicKeyHex) {
        throw new Error("No publicKeyHex returned.");
    }

    console.log(`[${new Date().toISOString()}] Public Key of the Challenger: ${publicKeyHex}`);
    const { walletKey } = await inquirer.prompt([INIT_PROMPTS["walletKeyPrompt"]]);
    if (!walletKey || walletKey.length < 1) {
        throw new Error("No private key passed in. Please provide a valid private key.")
    }

    let address: string;
    let signer: Signer;
    
    try {
        const signerResponse = getSignerFromPrivateKey(walletKey).signer;
        address = await signerResponse.getAddress();
        signer = signerResponse;
    } catch (error) {
        console.error(`Error getting signer from private key: ${(error as Error).message}`);
        return;
    }

    if (!address || !signer) {
        throw new Error(`Missing address: ${address} or signer ${signer}`);
    }
    cachedSigner = { address, signer };
    console.log(`[${new Date().toISOString()}] Address of the Wallet: ${cachedSigner!.address}`);

    const { webhookUrl } = await inquirer.prompt([INIT_PROMPTS["webhookUrlPrompt"]]);
    cachedWebhookUrl = webhookUrl;

    const { instance } = await inquirer.prompt([INIT_PROMPTS["instancePrompt"]]);
    CHALLENGER_INSTANCE = Number(instance);

    sendNotification(`Challenger instance ${CHALLENGER_INSTANCE} has started.`);
    lastAssertionTime = Date.now();
}

const onAssertionConfirmedCb = async (nodeNum: any) => {
    console.log(`[${new Date().toISOString()}] Assertion confirmed ${nodeNum}. Looking up the assertion information...`);

    if (CHALLENGER_INSTANCE != 1) {
        console.log(`[${new Date().toISOString()}] Backup challenger waiting for delay ${(CHALLENGER_INSTANCE) + (BACKUP_SUBMISSION_DELAY / (60 * 1000))} minutes..`);
        const currentTime = Date.now();
        await new Promise((resolve) => {
            setTimeout(resolve, (CHALLENGER_INSTANCE * 60 * 1000) + BACKUP_SUBMISSION_DELAY)
        });

        try {
            const hasSubmitted = await isAssertionSubmitted(nodeNum);
            if (hasSubmitted) {
                console.log(`[${new Date().toISOString()}] Assertion already submitted by other instance.`);
                lastAssertionTime = currentTime; //So our health check does not spam errors
                return;
            }
            console.log(`[${new Date().toISOString()}] Backup challenger found assertion not submitted and has to step in.`);
        } catch (error) {
            console.log(`[${new Date().toISOString()}] ERROR: Backup challenger isAssertionSubmitted: ${error}`);
            sendNotification(`Error Backup challenger instance ${CHALLENGER_INSTANCE} isAssertionSubmitted failed: ${error}`);
        }
    }

    const assertionNode = await getAssertion(nodeNum);
    console.log(`[${new Date().toISOString()}] Assertion data retrieved. Starting the submission process...`);
    try {
        await submitAssertionToReferee(
            cachedSecretKey,
            nodeNum,
            assertionNode,
            cachedSigner!.signer,
        );
        console.log(`[${new Date().toISOString()}] Submitted assertion: ${nodeNum}`);
        lastAssertionTime = Date.now();
    } catch (error) {
        if (error && (error as Error).message && (error as Error).message.includes('execution reverted: "9"')) {
            console.log(`[${new Date().toISOString()}] Could not submit challenge because it was already submitted`);
            lastAssertionTime = Date.now();
            return;
        }
        console.log(`[${new Date().toISOString()}] Submit Assertion Error: ${(error as Error).message}`);
        sendNotification(`Submit Assertion Error: ${(error as Error).message}`);
        throw error;
    }
};

const checkTimeSinceLastAssertion = async (lastAssertionTime: number) => {
    const currentTime = Date.now();
    console.log(`[${new Date().toISOString()}] The currentTime is ${currentTime}`);

    let criticalAmount = (70 * 60 * 1000);
    if (CHALLENGER_INSTANCE != 1) {
        criticalAmount += (CHALLENGER_INSTANCE * 60 * 1000);
    }

    if (currentTime - lastAssertionTime > criticalAmount) {
        let missedAssertion;
        try {
            missedAssertion = await findMissedAssertion();
        } catch (error) {
            console.log(`[${new Date().toISOString()}] Failed to findMissedAssertion (${error}).`);
            sendNotification(`Error: Challenger instance ${CHALLENGER_INSTANCE} failed to findMissedAssertion`);
        }

        const timeSinceLastAssertion = Math.round((currentTime - lastAssertionTime) / 60000);
        console.log(`[${new Date().toISOString()}] It has been ${timeSinceLastAssertion} minutes since the last assertion. Please check the Rollup Protocol (https://arbiscan.io/address/${config.rollupAddress}).`);
        if (missedAssertion !== null) {
            console.log(`[${new Date().toISOString()}] Found NodeConfirm event that has not been posted: AssertionId: ${missedAssertion}`);
            sendNotification(`It has been ${timeSinceLastAssertion} minutes since the last assertion - **A NODE CONFIRM EVENT HAS NOT BEEN SUBMITTED FOR CHALLENGE (Assertion: ${missedAssertion}) !**. Please check the challenger runtime and the RPC (${config.arbitrumOneWebSocketUrl})`);
        } else {
            sendNotification(`It has been ${timeSinceLastAssertion} minutes since the last assertion - No NodeConfirm events have been missed. Please check the Rollup Protocol (https://arbiscan.io/address/${config.rollupAddress}).`);
        }
    }
};

const sendNotification = async (message: string) => {
    if (cachedWebhookUrl) {
        try {
            await axios.post(cachedWebhookUrl, { text: `<!channel> [Instance ${CHALLENGER_INSTANCE}]: ${message}`, unfurl_links: false, });
        } catch (error) {
            console.log(`[${new Date().toISOString()}] Failed to send notification request ${error && (error as Error).message ? (error as Error).message : error}`);
        }
    }
}

const startListener = async () => {
    let errorCount = 0;
    let isStopping = false;

    const stopListener = (listener: any) => {
        if (!isStopping) {
            isStopping = true;
            listener.stop();
        }
    }

    return new Promise((resolve) => {
        const listener = listenForAssertions(
            async (nodeNum: any, blockHash: any, sendRoot: any, event: any, error?: EventListenerError) => {
                if (error) {
                    if (isStopping) {                        
                        // If we stopped manually we don't want to process the error from the closing event.
                        return;
                    }

                    errorCount++;
                    // We should allow a defined number of consecutive WS errors before restarting the websocket at all
                    if (errorCount > NUM_CON_WS_ALLOWED_ERRORS) {
                        stopListener(listener);
                        resolve(error);
                        return;
                    }

                    // If the error is an automatic reconnect after close it takes 1 second for the listener to restart, 
                    // it can happen, that we miss an assertion in that second,
                    // for that we wait 1 second before checking if we missed an assertion in between, after that the websocket should be back running

                    await new Promise((resolve) => {
                        setTimeout(resolve, 1000);
                    });
                    await processMissedAssertions().catch(() => { });

                    return;
                }

                errorCount = 0;

                try {
                    await onAssertionConfirmedCb(nodeNum);
                    currentNumberOfRetries = 0;
                } catch {
                    stopListener(listener);
                    resolve(error);
                }
            },
            (v: string) => console.log(v),
        );
    })
}

async function processMissedAssertions() {
    if (isProcessingMissedAssertions) {
        return Promise.resolve();
    }

    console.log(`[${new Date().toISOString()}] Looking for missed assertions...`);
    isProcessingMissedAssertions = true;

    let missedAssertionNodeNum;
    try {
        missedAssertionNodeNum = await findMissedAssertion();
    } catch (error: any) {
        console.log(`[${new Date().toISOString()}] Error looking for missed assertion: ${error}`);
        sendNotification(`Error looking for missed assertion ${error && error.message ? error.message : error}`);
    }

    if (missedAssertionNodeNum) {
        try {
            console.log(`[${new Date().toISOString()}] Found missed assertion with nodeNum: ${missedAssertionNodeNum}. Looking up the assertion information...`);
            const assertionNode = await getAssertion(missedAssertionNodeNum);
            console.log(`[${new Date().toISOString()}] Missed assertion data retrieved. Starting the submission process...`);

            await submitAssertionToReferee(
                cachedSecretKey,
                missedAssertionNodeNum,
                assertionNode,
                cachedSigner!.signer,
            );
            console.log(`[${new Date().toISOString()}] Submitted assertion: ${missedAssertionNodeNum}`);
            lastAssertionTime = Date.now();

        } catch (error) {
            isProcessingMissedAssertions = false;

            if (error && (error as Error).message && (error as Error).message.includes('execution reverted: "9"')) {
                console.log(`[${new Date().toISOString()}] Could not submit challenge because it was already submitted`);
                return;
            }
            sendNotification(`Submit missed assertion Error: ${(error as Error).message}`);
            throw error;
        }
    } else {
        console.log(`[${new Date().toISOString()}] Did not find any missing assertions`);
    }

    isProcessingMissedAssertions = false;
}

export function bootChallenger(cli: Command) {
    cli
        .command('boot-challenger')
        .description('Starts a runtime of the challenger. You will need the secret key of the challenger to start. You can run \'create-bls-key-pair\' to create this key.')
        .action(async () => {
            currentNumberOfRetries = 0;

            if (!cachedSigner || !cachedSecretKey) {
                await initCli();
            }
            
            // Listen for process termination and call the handler
            process.on('SIGINT', async () => {
                console.log(`[${new Date().toISOString()}] The challenger has been terminated manually.`);
                await sendNotification(`The challenger has been terminated manually.`);
                process.exit();
            });

            const assertionCheckInterval = setInterval(() => {
                checkTimeSinceLastAssertion(lastAssertionTime);
            }, 5 * 60 * 1000);

            for (; currentNumberOfRetries <= NUM_ASSERTION_LISTENER_RETRIES; currentNumberOfRetries++) {
                try {
                    isProcessingMissedAssertions = false;
                    await processMissedAssertions();
                } catch (error) {

                    //TODO what should we do if this fails, restarting the cmd won't help, it will most probably fail again
                    console.log(`[${new Date().toISOString()}] Failed to handle missed assertions - ${(error as Error).message}`);
                    await sendNotification(`Failed to handle missed assertions - ${(error as Error).message}`);
                }

                console.log(`[${new Date().toISOString()}] The challenger is now listening for assertions...`);
                await startListener();

                if (currentNumberOfRetries + 1 <= NUM_ASSERTION_LISTENER_RETRIES) {
                    const delayPerRetry = ASSERTION_LISTENER_RETRY_DELAYS[currentNumberOfRetries];
                    console.log(`[${new Date().toISOString()}] Challenger restarting after ${delayPerRetry / 1000} seconds`);
                    sendNotification(`Challenger restarting after ${delayPerRetry / 1000} seconds`);
                    
                    //Wait for delay per retry
                    await new Promise((resolve) => {
                        setTimeout(resolve, delayPerRetry);
                    });

                    console.log(`[${new Date().toISOString()}] Challenger restarting with ${NUM_ASSERTION_LISTENER_RETRIES - (currentNumberOfRetries + 1)} attempts left.`);
                    sendNotification(`Challenger restarting with ${NUM_ASSERTION_LISTENER_RETRIES - (currentNumberOfRetries + 1)} attempts left.`);
                }
            }

            clearInterval(assertionCheckInterval as NodeJS.Timeout);
            console.log(`[${new Date().toISOString()}] Challenger has stopped after ${NUM_ASSERTION_LISTENER_RETRIES} attempts.`);
            sendNotification(`Challenger has stopped after ${NUM_ASSERTION_LISTENER_RETRIES} attempts.`);

            return Promise.resolve(); //End boot-challenger command here after NUM_ASSERTION_LISTENER_RETRIES restarts
        });
}