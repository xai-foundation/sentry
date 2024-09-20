import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey, toggleAssertionChecking as coreToggleAssertionChecking } from "@sentry/core";

/**
 * Function to toggle the assertion checking in the Referee contract.
 * @param cli - Commander instance
 */
export function toggleAssertionChecking(cli: Command): void {
    cli
        .command('toggle-assertion-checking')
        .description('Toggles the assertion checking.')
        .action(async () => {
            try {
                // Prompt user for the private key of an admin
                const { privateKey } = await inquirer.prompt({
                    type: 'password',
                    name: 'privateKey',
                    message: 'Enter the private key of an admin:',
                    mask: '*',
                    validate: input => input.trim() === '' ? 'Private key is required' : true
                });

                // Get the signer from the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the toggleAssertionChecking function
                await coreToggleAssertionChecking(signer);

                console.log(`Assertion checking toggled.`);
            } catch (error) {
                console.error(`Error toggling assertion checking: ${(error as Error).message}`);
            }
        });
}
