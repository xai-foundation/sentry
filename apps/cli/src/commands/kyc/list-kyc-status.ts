import Vorpal from "vorpal";import { listKycStatuses as coreListKycStatuses } from "@sentry/core";

/**
 * Function to list all wallets and their KYC status in the Referee contract.
 * @param cli - Vorpal instance
 */
export function listKycStatuses(cli: Vorpal) {
    cli
        .command('list-kyc-statuses', 'Lists all wallets and their KYC status in the Referee contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            this.log(`Fetching all wallets and their KYC status...`);
            const kycStatuses = await coreListKycStatuses((wallet: string, isKycApproved: boolean) => {
                this.log(`Wallet: ${wallet}, KYC Approved: ${isKycApproved}`);
            });
            this.log(`KYC statuses retrieved.`);
        });
}
