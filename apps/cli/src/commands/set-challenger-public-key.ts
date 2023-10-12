import Vorpal from "vorpal";import { config, getSignerFromPrivateKey, RefereeAbi, setChallengerPublicKey as coreSetChallengerPublicKey } from "@xai-vanguard-node/core";

/**
 * Function to set the challenger public key in the Referee contract.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function setChallengerPublicKey(cli: Vorpal) {
    cli
        .command('set-challenger-public-key', 'Sets the challenger public key.')
        .action(async function (this: Vorpal.CommandInstance) {
            const privateKeyPrompt = {
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of an admin:'
            };
            const publicKeyPrompt = {
                type: 'input',
                name: 'publicKey',
                message: 'Enter the new challenger public key:'
            };
            const { privateKey, publicKey } = await this.prompt([privateKeyPrompt, publicKeyPrompt]);

            // Get the signer from the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the setChallengerPublicKey function
            await coreSetChallengerPublicKey(signer, publicKey);

            this.log(`Challenger public key set to: ${publicKey}`);
        });
}


