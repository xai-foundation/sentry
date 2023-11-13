import Vorpal from "vorpal";import { listWhitelistAddresses as coreListWhitelistAddresses } from "@sentry/core";

/**
 * Function to list all whitelisted addresses in the esXai contract.
 * @param cli - Vorpal instance
 */
export function listWhitelistAddresses(cli: Vorpal) {
    cli
        .command('list-whitelist-addresses', 'Lists all whitelisted addresses in the esXai contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            this.log(`Fetching all whitelisted addresses...`);
            const whitelistAddresses = await coreListWhitelistAddresses((address: string) => {
                this.log(`Address: ${address}`);
            });
            this.log(`Whitelisted addresses retrieved.`);
        });
}