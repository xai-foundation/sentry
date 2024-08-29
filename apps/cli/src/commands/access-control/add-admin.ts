import { Command } from 'commander';
import inquirer from 'inquirer';
import { addAddressToRole, getSignerFromPrivateKey } from '@sentry/core';

/**
 * Function to add an admin to the Referee contract.
 * @param program - Commander instance
 */
export function addAdmin(program: Command) {
    program
        .command('add-admin')
        .description('Adds an address to the DEFAULT_ADMIN_ROLE in the Referee contract.')
        .action(async () => {
            try {
                // Use Inquirer to prompt for address and private key
                const { address } = await inquirer.prompt({
                    type: 'input',
                    name: 'address',
                    message: 'Address to be added to the DEFAULT_ADMIN_ROLE:',
                    validate: (input) => input.length > 0 || 'Address is required.', // Validation for non-empty input
                });

                const { privateKey } = await inquirer.prompt({
                    type: 'password',
                    name: 'privateKey',
                    message: 'Private key of the current admin address. Must have DEFAULT_ADMIN_ROLE. Check by calling get-list-of-admins:',
                    mask: '*',
                    validate: (input) => input.length > 0 || 'Private key is required.', // Validation for non-empty input
                });

                console.log(`Adding address ${address} to the DEFAULT_ADMIN_ROLE...`);

                // Create a signer with the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                if (!signer) {
                    console.error('Failed to create a signer from the provided private key.');
                    return;
                }

                // Call the addAddressToRole function to add the address to the DEFAULT_ADMIN_ROLE
                await addAddressToRole(signer, 'DEFAULT_ADMIN_ROLE', address);

                console.log(`Address ${address} has been added to the DEFAULT_ADMIN_ROLE.`);

            } catch (error) {
                // Type guard to check if error is an instance of Error
                if (error instanceof Error) {
                    console.error('An error occurred:', error.message);
                } else {
                    console.error('An unexpected error occurred:', error);
                }
            }
        });
}
