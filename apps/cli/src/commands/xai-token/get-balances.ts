import Vorpal from "vorpal";import { getBalances } from "@sentry/core";

/**
 * Function to get the balances of a list of addresses.
 * @param cli - Vorpal instance
 */
export function getBalancesForAddresses(cli: Vorpal) {
    cli
        .command('get-balances', 'Gets the balances of a list of addresses.')
        .action(async function (this: Vorpal.CommandInstance) {
            const addressesPrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'addresses',
                message: 'Enter the addresses (comma-separated):'
            };
            const {addresses} = await this.prompt(addressesPrompt);
            const addressesArray = addresses.split(',').map((address: string) => address.trim());
            this.log(`Getting balances for addresses: ${addresses}...`);
            const balances = await getBalances(addressesArray, (address: string, xaiBalance: bigint, esXaiBalance: bigint) => {
                this.log(`Address: ${address}, Xai Balance: ${xaiBalance}, esXai Balance: ${esXaiBalance}`);
            });
            this.log(`Balances retrieved.`);
        });
}
