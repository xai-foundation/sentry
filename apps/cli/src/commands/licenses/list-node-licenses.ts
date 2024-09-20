import { Command } from 'commander';
import inquirer from 'inquirer';
import { listNodeLicenses as listNodeLicensesCore } from "@sentry/core";

/**
 * Function to list all NodeLicense token IDs owned by a particular address.
 * @param cli - Commander instance
 */
export function listNodeLicenses(cli: Command): void {
    cli
        .command('list-node-licenses')
        .description('Lists all NodeLicense token IDs owned by a particular address.')
        .action(async () => {
            // Prompt user for the address to list NodeLicense token IDs
            const { address } = await inquirer.prompt({
                type: 'input',
                name: 'address',
                message: 'Please enter the address to list NodeLicense token IDs for:'
            });

            console.log(`Fetching all NodeLicense token IDs for address ${address}...`);

            try {
                await listNodeLicensesCore(address, (tokenId: bigint) => {
                    console.log(`Token ID: ${tokenId}`);
                });
                console.log('NodeLicense token IDs retrieved.');
            } catch (error) {
                console.error(`Error retrieving NodeLicense token IDs: ${(error as Error).message}`);
            }
        });
}
