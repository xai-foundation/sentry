import { Command } from 'commander';
import { listAddressesForRole } from "@sentry/core";

/**
 * Registers the 'get-list-of-challengers' command with the provided CLI instance.
 * @param cli - The commander CLI instance.
 */
export function getListOfChallengers(cli: Command): void {
    cli
        .command('get-list-of-challengers')
        .description('Lists all addresses that have the challenger role.')
        .action(async () => {
            console.log(`Fetching all addresses with the challenger role...`);
            
            try {
                const addresses = await listAddressesForRole('CHALLENGER_ROLE');
                console.log(`Addresses retrieved. Here are the details:`);
                addresses.forEach((address: string, index: number) => {
                    console.log(`Address ${index + 1}: ${address}`);
                });
            } catch (error) {
                console.error(`Failed to fetch addresses: ${(error as Error).message}`);
            }
        });
}
