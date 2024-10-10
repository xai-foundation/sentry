import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey, setRollupAddress as coreSetRollupAddress } from "@sentry/core";

/**
 * Function to set the rollup address in the Referee contract.
 * @param cli - Commander instance
 */
export function setRollupAddress(cli: Command): void {
    cli
        .command('set-rollup-address')
        .description('Sets the rollup address.')
        .action(async () => {
            try {
                // Prompt user for the admin private key
                const { privateKey } = await inquirer.prompt({
                    type: 'password',
                    name: 'privateKey',
                    message: 'Enter the private key of an admin:',
                    mask: '*',
                    validate: input => input.trim() === '' ? 'Private key is required' : true
                });

                // Prompt user for the new rollup address
                const { rollupAddress } = await inquirer.prompt({
                    type: 'input',
                    name: 'rollupAddress',
                    message: 'Enter the new rollup address:',
                    validate: input => input.trim() === '' ? 'Rollup address is required' : true
                });

                // Get the signer from the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the setRollupAddress function
                await coreSetRollupAddress(signer, rollupAddress);

                console.log(`Rollup address set to: ${rollupAddress}`);
            } catch (error) {
                console.error(`Error setting rollup address: ${(error as Error).message}`);
            }
        });
}
