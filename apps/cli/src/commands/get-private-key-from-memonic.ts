import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromMnemonic } from "@sentry/core";

/**
 * Function to retrieve the private key from a mnemonic.
 * @param cli - Commander instance
 */
export function getPrivateKeyFromMnemonic(cli: Command): void {
    cli
        .command('get-private-key-from-mnemonic')
        .description('Takes in a mnemonic and an index and returns the public key and private key associated with it.')
        .action(async () => {
            // Prompt user for the mnemonic
            const { mnemonic } = await inquirer.prompt({
                type: 'input',
                name: 'mnemonic',
                message: 'Please enter your mnemonic:',
                validate: (input) => input.trim() !== '' || 'Mnemonic is required'
            });

            // Prompt user for the index
            const { index } = await inquirer.prompt({
                type: 'input',
                name: 'index',
                default: '0',
                message: 'Please enter the index (default is 0):',
                validate: (input) => !isNaN(Number(input)) || 'Index must be a number'
            });

            try {
                const { address, privateKey } = await getSignerFromMnemonic(mnemonic, parseInt(index));
                console.log(`Address: ${address}\nPrivate Key: ${privateKey}\nPlease secure your keys safely.`);
            } catch (error) {
                console.error(`Error retrieving keys: ${(error as Error).message}`);
            }
        });
}
