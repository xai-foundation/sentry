import Vorpal from "vorpal";
import { getTotalSupplyAndCap as getTotalSupplyAndCapCore } from "@xai-vanguard-node/core";

/**
 * Function to get the total supply and max supply of NodeLicense tokens.
 * @param cli - Vorpal instance
 */
export function getTotalSupplyAndCap(cli: Vorpal) {
    cli
        .command('get-total-supply-and-cap', 'Gets the total supply and max supply of NodeLicense tokens.')
        .action(async function (this: Vorpal.CommandInstance) {
            this.log(`Fetching total supply and max supply of NodeLicense tokens...`);
            const { totalSupply, maxSupply } = await getTotalSupplyAndCapCore();
            this.log(`Total Supply: ${totalSupply}`);
            this.log(`Max Supply: ${maxSupply}`);
        });
}
