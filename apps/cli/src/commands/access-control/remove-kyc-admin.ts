import { Command } from 'commander';
import inquirer from 'inquirer';
import { removeAddressFromRole, getSignerFromPrivateKey } from "@sentry/core";

/**
 * Function to remove a KYC admin from the Referee contract.
 * @param cli - Commander instance
 */
export function removeKycAdmin(cli: Command): void {
    cli
        .command('remove-kyc-admin')
        .description('Removes an address from the KYC_ADMIN_ROLE in the Referee contract.')
        .action(async () => {
            // Prompt user for the address to be removed
            const { address } = await inquirer.prompt({
                type: 'input',
                name: 'address',
                message: 'Address to be removed from the KYC_ADMIN_ROLE:'
            });

            // Prompt user for the private key of the current admin
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Private key of the current admin address. Must have DEFAULT_ADMIN_ROLE. Check by calling get-list-of-kyc-admins:',
                mask: '*',
            });

            if (!address || !privateKey) {
                console.log('Both address and private key are required.');
                return;
            }

            console.log(`Removing address ${address} from the KYC_ADMIN_ROLE...`);

            try {
                // Create a signer with the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the removeAddressFromRole function to remove the address from the KYC_ADMIN_ROLE
                await removeAddressFromRole(signer, 'KYC_ADMIN_ROLE', address);

                console.log(`Address ${address} has been removed from the KYC_ADMIN_ROLE.`);
            } catch (error) {
                console.error(`Failed to remove address: ${(error as Error).message}`);
            }
        });
}
