import Vorpal from "vorpal";
import axios from "axios";
import { config, createBlsKeyPair, getAssertion, getSignerFromPrivateKey, listenForAssertions, submitAssertionToReferee } from "@sentry/core";

let cachedSigner: any;
let cachedWebhookUrl: string | undefined;
let cachedSecretKey: string;
let lastAssertionTime: number;

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

const initCli = async (commandInstance: Vorpal.CommandInstance) => {

    const { secretKey }: any = await commandInstance.prompt(INIT_PROMPTS["secretKeyPrompt"]);

    if (!secretKey || secretKey.length < 1) {
        throw new Error("No secret key passed in. Please generate one with  'create-bls-key-pair'.")
    }
    cachedSecretKey = secretKey;
    const { publicKeyHex } = await createBlsKeyPair(secretKey);
    commandInstance.log(`[${new Date().toISOString()}] Public Key of the Challenger: ${publicKeyHex}`);

    const { walletKey }: any = await commandInstance.prompt(INIT_PROMPTS["walletKeyPrompt"]);
    if (!walletKey || walletKey.length < 1) {
        throw new Error("No private key passed in. Please provide a valid private key.")
    }

    const { address, signer } = getSignerFromPrivateKey(walletKey);
    commandInstance.log(`[${new Date().toISOString()}] Address of the Wallet: ${address}`);
    cachedSigner = signer;

    const { webhookUrl }: any = await commandInstance.prompt(INIT_PROMPTS["webhookUrlPrompt"]);
    cachedWebhookUrl = webhookUrl;
    sendNotification('Challenger has started.');

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
            cachedSigner,
        );
        commandInstance.log(`[${new Date().toISOString()}] Submitted assertion: ${nodeNum}`);
        lastAssertionTime = Date.now();
    } catch (error) {
        sendNotification(`Error: ${(error as Error).message}`);
        throw error;
    }
};

const checkTimeSinceLastAssertion = async (lastAssertionTime: number, webhookUrlInstance: string | undefined, commandInstance: Vorpal.CommandInstance,) => {
    const currentTime = Date.now();
    if (currentTime - lastAssertionTime > 70 * 60 * 1000) {
        const timeSinceLastAssertion = Math.round((currentTime - lastAssertionTime) / 60000);
        commandInstance.log(`[${new Date().toISOString()}] It has been ${timeSinceLastAssertion} minutes since the last assertion. Please check the Rollup Protocol (${config.rollupAddress}).`);
        sendNotification(`It has been ${timeSinceLastAssertion} minutes since the last assertion. Please check the Rollup Protocol (${config.rollupAddress}).`);
    }
    lastAssertionTime = currentTime;
};

const sendNotification = async (message: string) => {
    if (cachedWebhookUrl) {
        await axios.post(cachedWebhookUrl, { text: message });
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
            await initCli(commandInstance);

            listenForAssertions((nodeNum: any, blockHash: any, sendRoot: any, event: any) => { onAssertionConfirmedCb(nodeNum, commandInstance) }, (v: string) => this.log(v));

            // Check if submit assertion has not been run for over 1 hour and 10 minutes
            setInterval(() => {
                checkTimeSinceLastAssertion(lastAssertionTime, cachedWebhookUrl, this);
            }, 5 * 60 * 1000);

            // Listen for process termination and call the handler
            process.on('SIGINT', async () => {
                sendNotification(`The challenger is shutting down...`);
                process.exit();
            });

            commandInstance.log(`[${new Date().toISOString()}] The challenger is now listening for assertions...`);
            return new Promise((resolve, reject) => { }); // Keep the command alive
        });
}