import Vorpal from "vorpal";
import axios from "axios";
import { ethers } from 'ethers';
import { config, createBlsKeyPair, getAssertion, getSignerFromPrivateKey, listenForAssertions, submitAssertionToReferee, EventListenerError } from "@sentry/core";

type PromptBodyKey = "secretKeyPrompt" | "walletKeyPrompt" | "webhookUrlPrompt";

const INIT_PROMPTS: { [key in PromptBodyKey]: Vorpal.PromptObject } = {
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
    }
}

const NUM_ASSERTION_LISTENER_RETRIES: number = 3; //The number of restart attempts if the listener errors
const NUM_CON_WS_ALLOWED_ERRORS: number = 10; //The number of consecutive WS error we allow before restarting the listener

// Prompt input cache
let cachedSigner: {
    address: string,
    signer: ethers.Signer
};
let cachedWebhookUrl: string | undefined;
let cachedSecretKey: string;
let lastAssertionTime: number;

let currentNumberOfRetries = 0;

const initCli = async (commandInstance: Vorpal.CommandInstance) => {

    const { secretKey } = await commandInstance.prompt(INIT_PROMPTS["secretKeyPrompt"]);
    if (!secretKey || secretKey.length < 1) {
        throw new Error("No secret key passed in. Please generate one with  'create-bls-key-pair'.")
    }

    cachedSecretKey = secretKey;
    const { publicKeyHex } = await createBlsKeyPair(cachedSecretKey);
    if (!publicKeyHex) {
        throw new Error("No publicKeyHex returned.");
    }

    commandInstance.log(`[${new Date().toISOString()}] Public Key of the Challenger: ${publicKeyHex}`);
    const { walletKey }: any = await commandInstance.prompt(INIT_PROMPTS["walletKeyPrompt"]);
    if (!walletKey || walletKey.length < 1) {
        throw new Error("No private key passed in. Please provide a valid private key.")
    }

    const { address, signer } = getSignerFromPrivateKey(walletKey);
    if (!address || !signer) {
        throw new Error(`Missing address: ${address} or signer ${signer}`);
    }
    cachedSigner = { address, signer };
    commandInstance.log(`[${new Date().toISOString()}] Address of the Wallet: ${cachedSigner!.address}`);

    const { webhookUrl }: any = await commandInstance.prompt(INIT_PROMPTS["webhookUrlPrompt"]);
    cachedWebhookUrl = webhookUrl;
    sendNotification('Challenger has started.', commandInstance);
    lastAssertionTime = Date.now();

}

const onAssertionConfirmedCb = async (nodeNum: any, commandInstance: Vorpal.CommandInstance) => {
    commandInstance.log(`[${new Date().toISOString()}] Assertion confirmed ${nodeNum}. Looking up the assertion information...`);
    const assertionNode = await getAssertion(nodeNum);
    commandInstance.log(`[${new Date().toISOString()}] Assertion data retrieved. Starting the submission process...`);
    try {
        await submitAssertionToReferee(
            cachedSecretKey,
            nodeNum,
            assertionNode,
            cachedSigner!.signer,
        );
        commandInstance.log(`[${new Date().toISOString()}] Submitted assertion: ${nodeNum}`);
        lastAssertionTime = Date.now();
    } catch (error) {
        commandInstance.log(`[${new Date().toISOString()}] Submit Assertion Error: ${(error as Error).message}`);
        sendNotification(`Submit Assertion Error: ${(error as Error).message}`, commandInstance);
        throw error;
    }
};

const checkTimeSinceLastAssertion = async (lastAssertionTime: number, commandInstance: Vorpal.CommandInstance) => {
    const currentTime = Date.now();
    commandInstance.log(`[${new Date().toISOString()}] The currentTime is ${currentTime}`);
    if (currentTime - lastAssertionTime > 70 * 60 * 1000) {
        const timeSinceLastAssertion = Math.round((currentTime - lastAssertionTime) / 60000);
        commandInstance.log(`[${new Date().toISOString()}] It has been ${timeSinceLastAssertion} minutes since the last assertion. Please check the Rollup Protocol (${config.rollupAddress}).`);
        sendNotification(`It has been ${timeSinceLastAssertion} minutes since the last assertion. Please check the Rollup Protocol (${config.rollupAddress}).`, commandInstance);
    }
};

const sendNotification = async (message: string, commandInstance: Vorpal.CommandInstance) => {
    if (cachedWebhookUrl) {
        try {
            await axios.post(cachedWebhookUrl, { text: message });
        } catch (error) {
            commandInstance.log(`[${new Date().toISOString()}] Failed to send notification request ${error && (error as Error).message ? (error as Error).message : error}`);
        }
    }
}


const startListener = async (commandInstance: Vorpal.CommandInstance) => {

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
                    errorCount++;
                    // We should allow a defined number of consecutive WS errors before restarting the websocket at all
                    if (errorCount > NUM_CON_WS_ALLOWED_ERRORS) {
                        stopListener(listener);
                        resolve(error);
                    }
                    return;
                }


                try {
                    errorCount = 0;
                    await onAssertionConfirmedCb(nodeNum, commandInstance);
                    currentNumberOfRetries = 0;
                } catch {
                    stopListener(listener);
                    resolve(error);
                }
            },
            (v: string) => commandInstance.log(v),
        );
    })
}


/**
 * Starts a runtime of the challenger.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function bootChallenger(cli: Vorpal) {

    cli
        .command('boot-challenger', 'Starts a runtime of the challenger. You will need the secret key of the challenger to start. You can run \'create-bls-key-pair\' to create this key.')
        .action(async function (this: Vorpal.CommandInstance) {

            const commandInstance = this;

            if (!cachedSigner || !cachedSecretKey) {
                await initCli(commandInstance);
            }

            // Listen for process termination and call the handler
            process.on('SIGINT', async () => {
                commandInstance.log(`[${new Date().toISOString()}] The challenger has been terminated manually.`);
                await sendNotification(`The challenger has been terminated manually.`, commandInstance);
                process.exit();
            });

            // Check if submit assertion has not been run for over 1 hour and 10 minutes
            const assertionCheckInterval = setInterval(() => {
                checkTimeSinceLastAssertion(lastAssertionTime, commandInstance);
            }, 5 * 60 * 1000);

            for (; currentNumberOfRetries <= NUM_ASSERTION_LISTENER_RETRIES; currentNumberOfRetries++) {
                commandInstance.log(`[${new Date().toISOString()}] The challenger is now listening for assertions...`);
                await startListener(commandInstance);

                if (currentNumberOfRetries + 1 <= NUM_ASSERTION_LISTENER_RETRIES) {
                    await (new Promise((resolve) => {
                        setTimeout(resolve, 3000);
                    }))
                    commandInstance.log(`[${new Date().toISOString()}] Challenger restarting with ${NUM_ASSERTION_LISTENER_RETRIES - (currentNumberOfRetries + 1)} attempts left.`);
                    sendNotification(`Challenger restarting with ${NUM_ASSERTION_LISTENER_RETRIES - (currentNumberOfRetries + 1)} attempts left.`, commandInstance);
                }

            }

            clearInterval(assertionCheckInterval);
            commandInstance.log(`[${new Date().toISOString()}] Challenger has stopped after ${NUM_ASSERTION_LISTENER_RETRIES} attempts.`);
            sendNotification(`Challenger has stopped after ${NUM_ASSERTION_LISTENER_RETRIES} attempts.`, commandInstance);

            return Promise.resolve(); //End boot-challenger command here after NUM_ASSERTION_LISTENER_RETRIES restarts
        });
}