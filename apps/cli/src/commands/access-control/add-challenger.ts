import { Command } from 'commander';
import inquirer from 'inquirer';
import { addAddressToRole, getSignerFromPrivateKey } from "@sentry/core";

/**
 * Function to add a challenger to the Referee contract.
 * @param cli - Command instance
 */
export function addChallenger(cli: Command) {
    cli
        .command('add-challenger')
        .description('Adds an address to the CHALLENGER_ROLE in the Referee contract.')
        .action(async function() {
            const {address} = await inquirer.prompt({
                type: 'input',
                name: 'address',
                message: 'Address to be added to the CHALLENGER_ROLE:' 
            });

            const {privateKey} = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Private key of the admin address. Must have admin role. Check by calling get-list-of-admins:',
                mask: '*',
            });

            if (!address || !privateKey) {
                console.log('Both address and private key are required.');
                return;
            }

            console.log(`Adding address ${address} to the CHALLENGER_ROLE...`);

            // Create a signer with the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the addAddressToRole function to add the address to the CHALLENGER_ROLE
            await addAddressToRole(signer, 'CHALLENGER_ROLE', address);

            console.log(`Address ${address} has been added to the CHALLENGER_ROLE.`);
        });
}