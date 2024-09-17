import { Command } from 'commander';
import inquirer from 'inquirer';
import { listOperatorsForAddress } from "@sentry/core";

/**
 * Function to list all operators for a particular address in the Referee contract.
 * @param cli - Commander instance
 */
export function listOperators(cli: Command): void {
    cli
        .command('list-operators')
        .description('Lists all operators for a particular address in the Referee contract.')
        .action(async () => {
            // Prompt user for the address to list operators for
            const { address } = await inquirer.prompt({
                type: 'input',
                name: 'address',
                message: 'Please enter the address to list operators for:',
                validate: input => input.trim() === '' ? 'Address is required' : true
            });

            console.log(`Fetching all operators for address ${address}...`);

            try {
                // Call the core function to list operators for the address
                await listOperatorsForAddress(address, (operator: string, index: number) => {
                    console.log(`Operator ${index + 1}: ${operator}`);
                });
                console.log('Operators listed successfully.');
            } catch (error) {
                console.error(`Error listing operators: ${(error as Error).message}`);
            }
        });
}
