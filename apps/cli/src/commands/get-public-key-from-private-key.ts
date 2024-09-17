import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey } from "@sentry/core";

/**
 * Function to get the public key from a private key.
 * @param cli - Commander instance
 */
export function getPublicKeyFromPrivateKey(cli: Command): void {
    cli
        .command('get-public-key-from-private-key')
        .description('Takes in a private key and returns the public key associated with that.')
        .action(async () => {
            // Prompt user for the private key
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Please enter your private key:',
                mask: '*',
                validate: input => input.trim() === '' ? 'Private key is required' : true
            });

            try {
                const { address } = getSignerFromPrivateKey(privateKey);
                console.log(`Address: ${address}`);
            } catch (error) {
                console.error(`Error retrieving public key: ${(error as Error).message}`);
            }
        });
}
