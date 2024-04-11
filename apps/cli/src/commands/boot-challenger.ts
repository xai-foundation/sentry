import Vorpal from "vorpal";
import axios from "axios";
import { ethers } from 'ethers';
import { config, createBlsKeyPair, getAssertion, getSignerFromPrivateKey, listenForAssertions, submitAssertionToReferee, EventListenerError, findMissedAssertion, isAssertionSubmitted } from "@sentry/core";

type PromptBodyKey = "secretKeyPrompt" | "walletKeyPrompt" | "webhookUrlPrompt" | "instancePrompt";

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

// Prompt input cache
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

    const { instance }: any = await commandInstance.prompt(INIT_PROMPTS["instancePrompt"]);
    CHALLENGER_INSTANCE = Number(instance);

    sendNotification(`Challenger instance ${CHALLENGER_INSTANCE} has started.`, commandInstance);
    lastAssertionTime = Date.now();

}

const onAssertionConfirmedCb = async (nodeNum: any, commandInstance: Vorpal.CommandInstance) => {
    commandInstance.log(`[${new Date().toISOString()}] Assertion confirmed ${nodeNum}. Looking up the assertion information...`);

    if (CHALLENGER_INSTANCE != 1) {
        commandInstance.log(`[${new Date().toISOString()}] Backup challenger waiting for delay ${(CHALLENGER_INSTANCE) + (BACKUP_SUBMISSION_DELAY / (60 * 1000))} minutes..`);
        const currentTime = Date.now();
        await new Promise((resolve) => {
            setTimeout(resolve, (CHALLENGER_INSTANCE * 60 * 1000) + BACKUP_SUBMISSION_DELAY)
        });

        try {
            const hasSubmitted = await isAssertionSubmitted(nodeNum);
            if (hasSubmitted) {
                commandInstance.log(`[${new Date().toISOString()}] Assertion already submitted by other instance.`);
                lastAssertionTime = currentTime; //So our health check does not spam errors
                return;
            }
            commandInstance.log(`[${new Date().toISOString()}] Backup challenger found assertion not submitted and has to step in.`);
        } catch (error) {
            commandInstance.log(`[${new Date().toISOString()}] ERROR: Backup challenger isAssertionSubmitted: ${error}`);
            sendNotification(`Error Backup challenger instance ${CHALLENGER_INSTANCE} isAssertionSubmitted failed: ${error}`, commandInstance);
        }
    }

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

    let criticalAmount = (70 * 60 * 1000);
    if (CHALLENGER_INSTANCE != 1) {
        criticalAmount += (CHALLENGER_INSTANCE * 60 * 1000);
    }

    if (currentTime - lastAssertionTime > criticalAmount) {

        try {
            const missedAssertion = await findMissedAssertion();
            if (missedAssertion == null) {
                const passedSinceLastChallenge = currentTime - lastAssertionTime;
                lastAssertionTime = Date.now() - (passedSinceLastChallenge - 60 * 1000); //expect that the challenge got submitted at the correct time and resume with the correct health check warning
                return;
            }
        } catch (error) {
            commandInstance.log(`[${new Date().toISOString()}] Failed to findMissedAssertion (${error}).`);
            sendNotification(`Error: Backup Challenger instance ${CHALLENGER_INSTANCE} failed to findMissedAssertion`, commandInstance);
        }

        const timeSinceLastAssertion = Math.round((currentTime - lastAssertionTime) / 60000);
        commandInstance.log(`[${new Date().toISOString()}] It has been ${timeSinceLastAssertion} minutes since the last assertion. Please check the Rollup Protocol (${config.rollupAddress}).`);
        sendNotification(`It has been ${timeSinceLastAssertion} minutes since the last assertion. Please check the Rollup Protocol (${config.rollupAddress}).`, commandInstance);
    }
};

const sendNotification = async (message: string, commandInstance: Vorpal.CommandInstance) => {
    if (cachedWebhookUrl) {
        try {
            await axios.post(cachedWebhookUrl, { text: `@channel [Instance ${CHALLENGER_INSTANCE}]: ${message}` });
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

                if (errorCount != 0) {
                    //If the websocket just reconnected automatically we only want to try to re-post the last possibly missed challenge
                    await processMissedAssertions(commandInstance).catch(() => { });
                }

                errorCount = 0;

                try {
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

async function processMissedAssertions(commandInstance: Vorpal.CommandInstance) {
    commandInstance.log(`[${new Date().toISOString()}] Looking for missed assertions...`);

    const missedAssertionNodeNum = await findMissedAssertion();

    if (missedAssertionNodeNum) {
        commandInstance.log(`[${new Date().toISOString()}] Found missed assertion with nodeNum: ${missedAssertionNodeNum}. Looking up the assertion information...`);
        const assertionNode = await getAssertion(missedAssertionNodeNum);
        commandInstance.log(`[${new Date().toISOString()}] Missed assertion data retrieved. Starting the submission process...`);
        try {
            await submitAssertionToReferee(
                cachedSecretKey,
                missedAssertionNodeNum,
                assertionNode,
                cachedSigner!.signer,
            );
            commandInstance.log(`[${new Date().toISOString()}] Submitted assertion: ${missedAssertionNodeNum}`);
        } catch (error) {
            sendNotification(`Submit missed assertion Error: ${(error as Error).message}`, commandInstance);
            throw error;
        }
    } else {
        commandInstance.log(`[${new Date().toISOString()}] Did not find any missing assertions`);
    }
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
                try {
                    await processMissedAssertions(commandInstance);
                } catch (error) {
                    //TODO what should we do if this fails, restarting the cmd won't help, it will most probably fail again
                    commandInstance.log(`[${new Date().toISOString()}] Failed to handle missed assertions - ${(error as Error).message}`);
                    await sendNotification(`Failed to handle missed assertions - ${(error as Error).message}`, commandInstance);
                }

                commandInstance.log(`[${new Date().toISOString()}] The challenger is now listening for assertions...`);
                await startListener(commandInstance);

                if (currentNumberOfRetries + 1 <= NUM_ASSERTION_LISTENER_RETRIES) {
                    const delayPerRetry = ASSERTION_LISTENER_RETRY_DELAYS[currentNumberOfRetries];
                    commandInstance.log(`[${new Date().toISOString()}] Challenger restarting after ${delayPerRetry / 1000} seconds`);
                    sendNotification(`Challenger restarting after ${delayPerRetry / 1000} seconds`, commandInstance);

                    //Wait for delay per retry
                    await (new Promise((resolve) => {
                        setTimeout(resolve, delayPerRetry);
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