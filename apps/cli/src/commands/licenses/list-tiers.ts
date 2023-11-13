import Vorpal from "vorpal";
import { listTiers as listTiersCore, Tier } from "@sentry/core";

/**
 * Function to list all pricing tiers for node licenses.
 * @param cli - Vorpal instance
 */
export function listTiers(cli: Vorpal) {
    cli
        .command('list-tiers', 'Lists all pricing tiers for node licenses. This allows viewing the thresholds before pricing increases.')
        .action(async function (this: Vorpal.CommandInstance) {
            this.log(`Fetching all pricing tiers for node licenses...`);
            await listTiersCore((tier: Tier) => {
                this.log(`Tier: ${tier}, Price: ${tier.price.toString()}, Quantity: ${tier.quantity.toString()}`);
            });
            this.log(`Pricing tiers retrieved.`);
        });
}

