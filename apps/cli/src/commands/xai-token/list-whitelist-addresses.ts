import { Command } from 'commander';
import { listWhitelistAddresses as coreListWhitelistAddresses } from "@sentry/core";

/**
 * Function to list all whitelisted addresses in the esXai contract.
 * @param cli - Commander instance
 */
export function listWhitelistAddresses(cli: Command): void {
    cli
        .command('list-whitelist-addresses')
        .description('Lists all whitelisted addresses in the esXai contract.')
        .action(async () => {
            console.log('Fetching all whitelisted addresses...');
            try {
                await coreListWhitelistAddresses((address: string) => {
                    console.log(`Address: ${address}`);
                });
                console.log('Whitelisted addresses retrieved.');
            } catch (error) {
                console.error(`Error fetching whitelisted addresses: ${(error as Error).message}`);
            }
        });
}
