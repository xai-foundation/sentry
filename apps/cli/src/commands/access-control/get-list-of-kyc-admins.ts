import Vorpal from "vorpal";import { listAddressesForRole } from "@xai-vanguard-node/core";

export function getListOfKycAdmins(cli: Vorpal) {
    cli
        .command('get-list-of-kyc-admins', 'Lists all addresses that have the KYC admin role.')
        .action(async function (this: Vorpal.CommandInstance) {
            this.log(`Fetching all addresses with the KYC admin role...`);
            const addresses = await listAddressesForRole('KYC_ADMIN_ROLE');
            this.log(`Addresses retrieved. Here are the details:`);
            addresses.forEach((address: string, index: number) => {
                this.log(`Address ${index + 1}: ${address}`);
            });
        });
}
