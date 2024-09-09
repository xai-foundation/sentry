import { Command } from 'commander';
import { getTotalSupplyAndCap as getTotalSupplyAndCapCore } from "@sentry/core";

/**
 * Function to get the total supply and max supply of NodeLicense tokens.
 * @param cli - Commander instance
 */
export function getTotalSupplyAndCap(cli: Command): void {
    cli
        .command('get-total-supply-and-cap')
        .description('Gets the total supply and max supply of NodeLicense tokens.')
        .action(async () => {
            console.log('Fetching total supply and max supply of NodeLicense tokens...');
            try {
                const { totalSupply, maxSupply } = await getTotalSupplyAndCapCore();
                console.log(`Total Supply: ${totalSupply}`);
                console.log(`Max Supply: ${maxSupply}`);
            } catch (error) {
                console.error(`Error fetching total supply and max supply: ${(error as Error).message}`);
            }
        });
}
