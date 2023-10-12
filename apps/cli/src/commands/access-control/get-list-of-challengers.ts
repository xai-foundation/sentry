import Vorpal from "vorpal";import { listAddressesForRole } from "@xai-vanguard-node/core";

export function getListOfChallengers(cli: Vorpal) {
    cli
        .command('get-list-of-challengers', 'Lists all addresses that have the challenger role.')
        .action(async function (this: Vorpal.CommandInstance) {
            this.log(`Fetching all addresses with the challenger role...`);
            const addresses = await listAddressesForRole('CHALLENGER_ROLE');
            this.log(`Addresses retrieved. Here are the details:`);
            addresses.forEach((address: string, index: number) => {
                this.log(`Address ${index + 1}: ${address}`);
            });
        });
}
