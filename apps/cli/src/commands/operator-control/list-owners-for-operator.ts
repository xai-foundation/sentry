import Vorpal from "vorpal";
import { listOwnersForOperator } from "@xai-vanguard-node/core";

/**
 * Function to list all owners for a particular operator in the Referee contract.
 * @param cli - Vorpal instance
 */
export function listOwners(cli: Vorpal) {
    cli
        .command('list-owners', 'Lists all owners for a particular operator in the Referee contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {operatorAddress} = await this.prompt({
                type: 'input',
                name: 'operatorAddress',
                message: 'Please enter the operator address to list owners for:'
            });
            this.log(`Fetching all owners for operator ${operatorAddress}...`);
            await listOwnersForOperator(operatorAddress, (owner: string, index: number) => {
                this.log(`Owner ${index + 1}: ${owner}`);
            });
        });
}
