import * as Vorpal from "vorpal";
import { createBlsKeyPair as coreCreateBlsKeyPair } from "@xai-vanguard-node/core";

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
            const {secretKey} = await this.prompt(secretKeyPrompt);

            if (!secretKey || secretKey.length < 1) {
                throw new Error("No secret key passed in. Please generate one with  'create-bls-key-pair'.")
            }

            const { publicKeyHex } = await coreCreateBlsKeyPair(secretKey);
            this.log(`Public Key of the Challenger: ${publicKeyHex}`);
            this.log('The challenger is now listening for assertions...');
        });
}