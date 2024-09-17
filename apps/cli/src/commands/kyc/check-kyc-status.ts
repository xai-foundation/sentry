import { Command } from 'commander';
import inquirer from 'inquirer';
import { checkKycStatus as coreCheckKycStatus } from "@sentry/core";

/**
 * Function to check the KYC status of a list of wallets in the Referee contract.
 * @param cli - Commander instance
 */
export function checkKycStatus(cli: Command): void {
    cli
        .command('check-kyc-status')
        .description('Checks the KYC status of a list of wallets in the Referee contract. Wallets should be provided as a comma-separated list.')
        .action(async () => {
            // Prompt user for the wallets to check
            const { wallets } = await inquirer.prompt({
                type: 'input',
                name: 'wallets',
                message: 'Enter the wallets (comma-separated):'
            });

            const walletsArray = wallets.split(',').map((wallet: string) => wallet.trim());

            console.log(`Checking KYC status for wallets: ${wallets}...`);

            try {
                await coreCheckKycStatus(walletsArray, (wallet: string, isKycApproved: boolean) => {
                    console.log(`Wallet: ${wallet}, KYC Approved: ${isKycApproved}`);
                });
                console.log(`KYC statuses retrieved.`);
            } catch (error) {
                console.error(`Failed to check KYC statuses: ${(error as Error).message}`);
            }
        });
}
