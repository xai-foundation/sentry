import Vorpal from "vorpal";import { listNodeLicenses as listNodeLicensesCore } from "@xai-vanguard-node/core";

/**
 * Function to list all NodeLicense token IDs owned by a particular address.
 * @param cli - Vorpal instance
 */
export function listNodeLicenses(cli: Vorpal) {
    cli
        .command('list-node-licenses', 'Lists all NodeLicense token IDs owned by a particular address.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {address} = await this.prompt({
                type: 'input',
                name: 'address',
                message: 'Please enter the address to list NodeLicense token IDs for:'
            });
            this.log(`Fetching all NodeLicense token IDs for address ${address}...`);
            await listNodeLicensesCore(address, (tokenId: bigint) => {
                this.log(`Token ID: ${tokenId}`);
            });
            this.log(`NodeLicense token IDs retrieved.`);
        });
}
