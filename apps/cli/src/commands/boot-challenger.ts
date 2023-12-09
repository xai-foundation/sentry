import Vorpal from "vorpal";
import { createBlsKeyPair, getAssertion, getSignerFromPrivateKey, listenForAssertions, submitAssertionToReferee } from "@sentry/core";

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

            // start a listener for the assertions coming in
            // @ts-ignore
            listenForAssertions(async (nodeNum, blockHash, sendRoot, event) => {
                this.log(`[${new Date().toISOString()}] Assertion confirmed ${nodeNum}. Looking up the assertion information...`);
                const assertionNode = await getAssertion(nodeNum);
                this.log(`[${new Date().toISOString()}] Assertion data retrieved. Starting the submission process...`);
                await submitAssertionToReferee(
                    secretKey,
                    nodeNum,
                    assertionNode,
                    signer,
                );
                this.log(`[${new Date().toISOString()}] Submitted assertion: ${nodeNum}`);
            }, (v: string) => this.log(v));

            this.log(`[${new Date().toISOString()}] The challenger is now listening for assertions...`);
            return new Promise((resolve, reject) => { }); // Keep the command alive
        });
}