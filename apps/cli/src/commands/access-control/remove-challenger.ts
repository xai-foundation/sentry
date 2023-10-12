import Vorpal from "vorpal";import { removeAddressFromRole, getSignerFromPrivateKey } from "@xai-vanguard-node/core";

/**
 * Function to remove a challenger from the Referee contract.
 * @param cli - Vorpal instance
 */
export function removeChallenger(cli: Vorpal) {
    cli
        .command('remove-challenger', 'Removes an address from the DEFAULT_CHALLENGER_ROLE in the Referee contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {address} = await this.prompt({
                type: 'input',
                name: 'address',
                message: 'Address to be removed from the CHALLENGER_ROLE:' 
            });

            const {privateKey} = await this.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Private key of the current admin address. Must have DEFAULT_ADMIN_ROLE. Check by calling get-list-of-admins:',
                mask: '*',
            });

            if (!address || !privateKey) {
                this.log('Both address and private key are required.');
                return;
            }

            this.log(`Removing address ${address} from the CHALLENGER_ROLE...`);

            // Create a signer with the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the removeAddressFromRole function to remove the address from the DEFAULT_CHALLENGER_ROLE
            await removeAddressFromRole(signer, 'CHALLENGER_ROLE', address);

            this.log(`Address ${address} has been removed from the CHALLENGER_ROLE.`);
        });
}
