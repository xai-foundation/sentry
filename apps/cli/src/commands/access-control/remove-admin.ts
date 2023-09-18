import * as Vorpal from "vorpal";
import { removeAddressFromRole, getSignerFromPrivateKey } from "@xai-vanguard-node/core";

/**
 * Function to remove an admin from the Referee contract.
 * @param cli - Vorpal instance
 */
export function removeAdmin(cli: Vorpal) {
    cli
        .command('remove-admin', 'Removes an address from the DEFAULT_ADMIN_ROLE in the Referee contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {address} = await this.prompt({
                type: 'input',
                name: 'address',
                message: 'Address to be removed from the DEFAULT_ADMIN_ROLE.' 
            });

            const {privateKey} = await this.prompt({
                type: 'input',
                name: 'privateKey',
                message: 'Private key of the current admin address. Must have DEFAULT_ADMIN_ROLE. Check by calling get-list-of-admins.'
            });

            if (!address || !privateKey) {
                this.log('Both address and private key are required.');
                return;
            }

            this.log(`Removing address ${address} from the DEFAULT_ADMIN_ROLE...`);

            // Create a signer with the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the removeAddressFromRole function to remove the address from the DEFAULT_ADMIN_ROLE
            await removeAddressFromRole(signer, 'DEFAULT_ADMIN_ROLE', address);

            this.log(`Address ${address} has been removed from the DEFAULT_ADMIN_ROLE.`);
        });
}
