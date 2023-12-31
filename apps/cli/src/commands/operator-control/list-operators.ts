import Vorpal from "vorpal";
import { listOperatorsForAddress } from "@sentry/core";

/**
 * Function to list all operators for a particular address in the Referee contract.
 * @param cli - Vorpal instance
 */
export function listOperators(cli: Vorpal) {
    cli
        .command('list-operators', 'Lists all operators for a particular address in the Referee contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {address} = await this.prompt({
                type: 'input',
                name: 'address',
                message: 'Please enter the address to list operators for:'
            });
            this.log(`Fetching all operators for address ${address}...`);
            await listOperatorsForAddress(address, (operator: string, index: number) => {
                this.log(`Operator ${index + 1}: ${operator}`);
            });
        });
}
