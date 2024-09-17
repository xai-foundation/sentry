import { Command } from 'commander';
import inquirer from 'inquirer';
import { listOwnersForOperator } from "@sentry/core";

/**
 * Function to list all owners for a particular operator in the Referee contract.
 * @param cli - Commander instance
 */
export function listOwners(cli: Command): void {
    cli
        .command('list-owners')
        .description('Lists all owners for a particular operator in the Referee contract.')
        .action(async () => {
            // Prompt user for the operator address to list owners for
            const { operatorAddress } = await inquirer.prompt({
                type: 'input',
                name: 'operatorAddress',
                message: 'Please enter the operator address to list owners for:',
                validate: input => input.trim() === '' ? 'Operator address is required' : true
            });

            console.log(`Fetching all owners for operator ${operatorAddress}...`);

            try {
                await listOwnersForOperator(operatorAddress, (owner: string, index: number) => {
                    console.log(`Owner ${index + 1}: ${owner}`);
                });
            } catch (error) {
                console.error(`Error fetching owners: ${(error as Error).message}`);
            }
        });
}
