import * as Vorpal from "vorpal";
import { addAddressToRole, getSignerFromPrivateKey } from "@xai-vanguard-node/core";

/**
 * Function to add a KYC admin to the Referee contract.
 * @param cli - Vorpal instance
 */
export function addKycAdmin(cli: Vorpal) {
    cli
        .command('add-kyc-admin', 'Adds an address to the KYC_ADMIN_ROLE in the Referee contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {address} = await this.prompt({
                type: 'input',
                name: 'address',
                message: 'Address to be added to the KYC_ADMIN_ROLE:' 
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

            this.log(`Adding address ${address} to the KYC_ADMIN_ROLE...`);

            // Create a signer with the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the addAddressToRole function to add the address to the KYC_ADMIN_ROLE
            await addAddressToRole(signer, 'KYC_ADMIN_ROLE', address);

            this.log(`Address ${address} has been added to the KYC_ADMIN_ROLE.`);
        });
}
