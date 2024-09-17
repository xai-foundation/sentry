import { Command } from 'commander';
import inquirer from 'inquirer';
import { checkWhitelist as coreCheckWhitelist } from "@sentry/core";

/**
 * Function to check the whitelist status of a list of wallets in the esXai contract.
 * @param cli - Commander instance
 */
export function checkWhitelist(cli: Command): void {
    cli
        .command('check-whitelist')
        .description('Checks the whitelist status of a list of wallets in the esXai contract. Wallets should be provided as a comma-separated list.')
        .action(async () => {
            // Prompt user for the wallets to check
            const { wallets } = await inquirer.prompt({
                type: 'input',
                name: 'wallets',
                message: 'Enter the wallets (comma-separated):',
                validate: input => input.trim() === '' ? 'Please enter at least one wallet address.' : true
            });

            const walletsArray = wallets.split(',').map((wallet: string) => wallet.trim());
            console.log(`Checking whitelist status for wallets: ${wallets}...`);

            try {
                await coreCheckWhitelist(walletsArray, (wallet: string, isWhitelisted: boolean) => {
                    console.log(`Wallet: ${wallet}, Whitelisted: ${isWhitelisted}`);
                });
                console.log('Whitelist statuses retrieved.');
            } catch (error) {
                console.error(`Error checking whitelist status: ${(error as Error).message}`);
            }
        });
}
