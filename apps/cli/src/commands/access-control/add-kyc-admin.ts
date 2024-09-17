import { Command } from 'commander';
import inquirer from 'inquirer';
import { addAddressToRole, getSignerFromPrivateKey } from "@sentry/core";

/**
 * Function to add a KYC admin to the Referee contract.
 * @param cli - Command instance
 */
export function addKycAdmin(cli: Command) {
    cli
        .command('add-kyc-admin')
        .description('Adds an address to the KYC_ADMIN_ROLE in the Referee contract.')
        .action(async function () {
            try {
                const {address} = await inquirer.prompt({
                    type: 'input',
                    name: 'address',
                    message: 'Address to be added to the KYC_ADMIN_ROLE:' 
                });

                const {privateKey} = await inquirer.prompt({
                    type: 'password',
                    name: 'privateKey',
                    message: 'Private key of the current admin address. Must have DEFAULT_ADMIN_ROLE. Check by calling get-list-of-admins:',
                    mask: '*',
                });

                if (!address || !privateKey) {
                    console.log('Both address and private key are required.');
                    return;
                }

                console.log(`Adding address ${address} to the KYC_ADMIN_ROLE...`);

                // Create a signer with the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the addAddressToRole function to add the address to the KYC_ADMIN_ROLE
                await addAddressToRole(signer, 'KYC_ADMIN_ROLE', address);

                console.log(`Address ${address} has been added to the KYC_ADMIN_ROLE.`);
            } catch (error) {
                console.error('An error occurred:', error instanceof Error ? error.message : error);
            }
        });
}
