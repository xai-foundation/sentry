import * as Vorpal from "vorpal";
import { checkKycStatus as coreCheckKycStatus } from "@xai-vanguard-node/core";

/**
 * Function to check the KYC status of a list of wallets in the Referee contract.
 * @param cli - Vorpal instance
 */
export function checkKycStatus(cli: Vorpal) {
    cli
        .command('check-kyc-status', 'Checks the KYC status of a list of wallets in the Referee contract. Wallets should be provided as a comma-separated list.')
        .action(async function (this: Vorpal.CommandInstance) {
            const walletsPrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'wallets',
                message: 'Enter the wallets (comma-separated):'
            };
            const {wallets} = await this.prompt(walletsPrompt);
            const walletsArray = wallets.split(',').map((wallet: string) => wallet.trim());
            this.log(`Checking KYC status for wallets: ${wallets}...`);
            await coreCheckKycStatus(walletsArray, (wallet: string, isKycApproved: boolean) => {
                this.log(`Wallet: ${wallet}, KYC Approved: ${isKycApproved}`);
            });
            this.log(`KYC statuses retrieved.`);
        });
}

