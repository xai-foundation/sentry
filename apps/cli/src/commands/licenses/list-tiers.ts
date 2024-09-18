import { Command } from 'commander';
import { listTiers as listTiersCore, Tier } from "@sentry/core";

/**
 * Function to list all pricing tiers for node licenses.
 * @param cli - Commander instance
 */
export function listTiers(cli: Command): void {
    cli
        .command('list-tiers')
        .description('Lists all pricing tiers for node licenses. This allows viewing the thresholds before pricing increases.')
        .action(async () => {
            console.log('Fetching all pricing tiers for node licenses...');
            try {
                await listTiersCore((tier: Tier) => {
                    console.log(`Tier: ${tier}, Price: ${tier.price.toString()}, Quantity: ${tier.quantity.toString()}`);
                });
                console.log('Pricing tiers retrieved.');
            } catch (error) {
                console.error(`Error fetching pricing tiers: ${(error as Error).message}`);
            }
        });
}
