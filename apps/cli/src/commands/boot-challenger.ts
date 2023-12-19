import Vorpal from "vorpal";
import axios from "axios";
import { config, createBlsKeyPair, getAssertion, getSignerFromPrivateKey, listenForAssertions, submitAssertionToReferee } from "@sentry/core";

/**
 * Starts a runtime of the challenger.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function bootChallenger(cli: Vorpal) {
    cli
        .command('boot-challenger', 'Starts a runtime of the challenger. You will need the secret key of the challenger to start. You can run \'create-bls-key-pair\' to create this key.')
        .action(async function (this: Vorpal.CommandInstance) {
            const secretKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'secretKey',
                message: 'Enter the secret key of the challenger (You can run \'create-bls-key-pair\' to create this key):',
                mask: '*'
            };
            const { secretKey } = await this.prompt(secretKeyPrompt);

            if (!secretKey || secretKey.length < 1) {
                throw new Error("No secret key passed in. Please generate one with  'create-bls-key-pair'.")
            }

            const { publicKeyHex } = await createBlsKeyPair(secretKey);
            this.log(`[${new Date().toISOString()}] Public Key of the Challenger: ${publicKeyHex}`);

            const walletKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'walletKey',
                message: 'Enter the private key of the wallet that the challenger wants to use:',
                mask: '*'
            };
            const { walletKey } = await this.prompt(walletKeyPrompt);

            if (!walletKey || walletKey.length < 1) {
                throw new Error("No private key passed in. Please provide a valid private key.")
            }

            const { address, signer } = getSignerFromPrivateKey(walletKey);
            this.log(`[${new Date().toISOString()}] Address of the Wallet: ${address}`);

            const webhookUrlPrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'webhookUrl',
                message: 'Enter the webhook URL if you want to post errors (optional):',
            };
            const { webhookUrl } = await this.prompt(webhookUrlPrompt);

            if (webhookUrl) {
                await axios.post(webhookUrl, { text: 'Challenger has started.' });
            }

            let lastAssertionTime = Date.now();

            // start a listener for the assertions coming in
            // @ts-ignore
            listenForAssertions(async (nodeNum, blockHash, sendRoot, event) => {
                this.log(`[${new Date().toISOString()}] Assertion confirmed ${nodeNum}. Looking up the assertion information...`);
                const assertionNode = await getAssertion(nodeNum);
                this.log(`[${new Date().toISOString()}] Assertion data retrieved. Starting the submission process...`);
                try {
                    await submitAssertionToReferee(
                        secretKey,
                        nodeNum,
                        assertionNode,
                        signer,
                    );
                    this.log(`[${new Date().toISOString()}] Submitted assertion: ${nodeNum}`);
                    lastAssertionTime = Date.now();
                } catch (error) {
                    if (webhookUrl) {
                        await axios.post(webhookUrl, { text: `Error: ${(error as Error).message}` });
                    }
                    throw error;
                }
            }, (v: string) => this.log(v));

            // Check if submit assertion has not been run for over 1 hour and 10 minutes
            setInterval(async () => {
                const currentTime = Date.now();
                if (currentTime - lastAssertionTime > 70 * 60 * 1000) {
                    const timeSinceLastAssertion = Math.round((currentTime - lastAssertionTime) / 60000);
                    this.log(`[${new Date().toISOString()}] It has been ${timeSinceLastAssertion} minutes since the last assertion. Please check the Rollup Protocol (${config.rollupAddress}).`);
                    if (webhookUrl) {
                        await axios.post(webhookUrl, { text: `It has been ${timeSinceLastAssertion} minutes since the last assertion. Please check the Rollup Protocol (${config.rollupAddress}).` });
                    }
                }
                lastAssertionTime = currentTime;
            }, 5 * 60 * 1000); // Check every 5 minutes

            // Listen for process termination and send a message to slack
            process.on('SIGINT', async () => {
                if (webhookUrl) {
                    await axios.post(webhookUrl, { text: `The challenger is shutting down...` });
                }
                process.exit();
            });

            this.log(`[${new Date().toISOString()}] The challenger is now listening for assertions...`);
            return new Promise((resolve, reject) => { }); // Keep the command alive
        });
}