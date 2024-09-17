import { Command } from 'commander';
import { getTotalSupply } from "@sentry/core";

/**
 * Function to return the total supply of tokens in circulation.
 * @param cli - Commander instance
 */
export function totalSupply(cli: Command): void {
    cli
        .command('total-supply')
        .description('Returns the total supply of tokens in circulation.')
        .action(async () => {
            try {
                const { esXaiTotalSupply, xaiTotalSupply, totalSupply } = await getTotalSupply();
                console.log(`esXai Total Supply: ${esXaiTotalSupply}\nXai Total Supply: ${xaiTotalSupply}\nTotal Supply: ${totalSupply}`);
            } catch (error) {
                console.error(`Error fetching total supply: ${(error as Error).message}`);
            }
        });
}
