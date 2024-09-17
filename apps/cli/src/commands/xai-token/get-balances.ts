import { Command } from 'commander';
import inquirer from 'inquirer';
import { getBalances } from "@sentry/core";

/**
 * Function to get the balances of a list of addresses.
 * @param cli - Commander instance
 */
export function getBalancesForAddresses(cli: Command): void {
    cli
        .command('get-balances')
        .description('Gets the balances of a list of addresses.')
        .action(async () => {
            // Prompt user for the addresses to get balances
            const { addresses } = await inquirer.prompt({
                type: 'input',
                name: 'addresses',
                message: 'Enter the addresses (comma-separated):',
                validate: input => input.trim() === '' ? 'Addresses are required' : true
            });

            const addressesArray = addresses.split(',').map((address: string) => address.trim());
            console.log(`Getting balances for addresses: ${addresses}...`);

            try {
                // Call core function to get balances for the addresses
                const balances = await getBalances(addressesArray, (address: string, xaiBalance: bigint, esXaiBalance: bigint) => {
                    console.log(`Address: ${address}, Xai Balance: ${xaiBalance.toString()}, esXai Balance: ${esXaiBalance.toString()}`);
                });
                
                console.log('Balances retrieved successfully.');
            } catch (error) {
                console.error(`Error retrieving balances: ${(error as Error).message}`);
            }
        });
}
