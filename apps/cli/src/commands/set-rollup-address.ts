import * as Vorpal from "vorpal";
import { getSignerFromPrivateKey, setRollupAddress as coreSetRollupAddress } from "@xai-vanguard-node/core";

/**
 * Function to set the rollup address in the Referee contract.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function setRollupAddress(cli: Vorpal) {
    cli
        .command('set-rollup-address', 'Sets the rollup address.')
        .action(async function (this: Vorpal.CommandInstance) {
            const privateKeyPrompt = {
                type: 'password',
                name: 'key',
                message: 'Enter the private key of an admin:'
            };
            const rollupAddressPrompt = {
                type: 'input',
                name: 'rollupAddress',
                message: 'Enter the new rollup address:'
            };
            const { key: privateKey, rollupAddress } = await this.prompt([privateKeyPrompt, rollupAddressPrompt]);

            // Get the signer from the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the setRollupAddress function
            await coreSetRollupAddress(signer, rollupAddress);

            this.log(`Rollup address set to: ${rollupAddress}`);
        });
}
