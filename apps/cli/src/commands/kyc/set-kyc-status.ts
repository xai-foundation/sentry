import Vorpal from "vorpal";import { setKycStatus as coreSetKycStatus, getSignerFromPrivateKey } from "@xai-vanguard-node/core";

/**
 * Function to set the KYC status of a list of wallets in the Referee contract.
 * @param cli - Vorpal instance
 */
export function setKycStatus(cli: Vorpal) {
    cli
        .command('set-kyc-status', 'Sets the KYC status of a list of wallets in the Referee contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            const walletsPrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'wallets',
                message: 'Enter the wallets (comma-separated):'
            };
            const statusPrompt: Vorpal.PromptObject = {
                type: 'confirm',
                name: 'status',
                message: 'Enter the KYC status for all wallets (true or false):'
            };
            const privateKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of an admin:'
            };
            const {wallets} = await this.prompt(walletsPrompt);
            const {status} = await this.prompt(statusPrompt);
            const {privateKey} = await this.prompt(privateKeyPrompt);
            const walletsArray = wallets.split(',').map((wallet: string) => wallet.trim());
            const walletsStatuses = walletsArray.reduce((acc: {[key: string]: typeof status}, wallet: string) => ({...acc, [wallet]: status}), {});
            this.log(`Setting KYC status for wallets: ${wallets}...`);
            const { signer } = getSignerFromPrivateKey(privateKey);
            await coreSetKycStatus(signer, walletsStatuses, (wallet: string, isKycApproved: boolean) => {
                this.log(`Wallet: ${wallet}, KYC Approved: ${isKycApproved}`);
            });
            this.log(`KYC statuses set.`);
        });
}
