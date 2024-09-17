import { Command } from 'commander';
import { listKycStatuses as coreListKycStatuses } from "@sentry/core";

/**
 * Function to list all wallets and their KYC status in the Referee contract.
 * @param cli - Commander instance
 */
export function listKycStatuses(cli: Command): void {
    cli
        .command('list-kyc-statuses')
        .description('Lists all wallets and their KYC status in the Referee contract.')
        .action(async () => {
            console.log(`Fetching all wallets and their KYC status...`);
            try {
                await coreListKycStatuses((wallet: string, isKycApproved: boolean) => {
                    console.log(`Wallet: ${wallet}, KYC Approved: ${isKycApproved}`);
                });
                console.log(`KYC statuses retrieved.`);
            } catch (error) {
                console.error(`Failed to retrieve KYC statuses: ${(error as Error).message}`);
            }
        });
}
