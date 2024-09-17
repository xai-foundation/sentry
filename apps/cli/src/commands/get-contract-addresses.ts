import { Command } from 'commander';
import { config } from "@sentry/core";

/**
 * Function to get all contract addresses from the config and log them in the console.
 * @param cli - Commander instance
 */
export function getAllContractAddresses(cli: Command): void {
    cli
        .command('get-all-contract-addresses')
        .description('Fetches all the contract addresses.')
        .action(async () => {
            const addresses = {
                "ES XAI Address": config.esXaiAddress,
                "Node License Address": config.nodeLicenseAddress,
                "Referee Address": config.refereeAddress,
                "Rollup Address": config.rollupAddress,
                "XAI Address": config.xaiAddress,
                "Gas Subsidy Contract": config.gasSubsidyAddress
            };

            console.log("Fetching all contract addresses...");
            for (const [name, address] of Object.entries(addresses)) {
                console.log(`${name}: ${address}`);
            }
        });
}
