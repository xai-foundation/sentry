import Vorpal from "vorpal";import { addAddressToRole, getSignerFromPrivateKey } from "@xai-vanguard-node/core";

/**
 * Function to add a challenger to the Referee contract.
 * @param cli - Vorpal instance
 */
export function addChallenger(cli: Vorpal) {
    cli
        .command('add-challenger', 'Adds an address to the CHALLENGER_ROLE in the Referee contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {address} = await this.prompt({
                type: 'input',
                name: 'address',
                message: 'Address to be added to the CHALLENGER_ROLE:' 
            });

            const {privateKey} = await this.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Private key of the admin address. Must have admin role. Check by calling get-list-of-admins:',
                mask: '*',
            });

            if (!address || !privateKey) {
                this.log('Both address and private key are required.');
                return;
            }

            this.log(`Adding address ${address} to the CHALLENGER_ROLE...`);

            // Create a signer with the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the addAddressToRole function to add the address to the CHALLENGER_ROLE
            await addAddressToRole(signer, 'CHALLENGER_ROLE', address);

            this.log(`Address ${address} has been added to the CHALLENGER_ROLE.`);
        });
}
