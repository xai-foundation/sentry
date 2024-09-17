import { Command } from 'commander';
import inquirer from 'inquirer';
import { removeAddressFromRole, getSignerFromPrivateKey } from "@sentry/core";

/**
 * Function to remove an admin from the Referee contract.
 * @param cli - Commander instance
 */
export function removeAdmin(cli: Command): void {
    cli
        .command('remove-admin')
        .description('Removes an address from the DEFAULT_ADMIN_ROLE in the Referee contract.')
        .action(async () => {
            const { address } = await inquirer.prompt({
                type: 'input',
                name: 'address',
                message: 'Address to be removed from the DEFAULT_ADMIN_ROLE:'
            });

            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Private key of the current admin address. Must have DEFAULT_ADMIN_ROLE. Check by calling get-list-of-admins:',
                mask: '*',
            });

            if (!address || !privateKey) {
                console.log('Both address and private key are required.');
                return;
            }

            console.log(`Removing address ${address} from the DEFAULT_ADMIN_ROLE...`);

            try {
                // Create a signer with the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the removeAddressFromRole function to remove the address from the DEFAULT_ADMIN_ROLE
                await removeAddressFromRole(signer, 'DEFAULT_ADMIN_ROLE', address);

                console.log(`Address ${address} has been removed from the DEFAULT_ADMIN_ROLE.`);
            } catch (error) {
                console.error(`Failed to remove address: ${(error as Error).message}`);
            }
        });
}
