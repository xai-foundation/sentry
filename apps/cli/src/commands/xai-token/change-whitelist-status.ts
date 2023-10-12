import Vorpal from "vorpal";import { changeWhitelistStatus as coreChangeWhitelistStatus, getSignerFromPrivateKey } from "@xai-vanguard-node/core";

/**
 * Function to change the whitelist status of a list of wallets in the esXai contract.
 * @param cli - Vorpal instance
 */
export function changeWhitelistStatus(cli: Vorpal) {
    cli
        .command('change-whitelist-status', 'Changes the whitelist status of a list of wallets in the esXai contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            const walletsPrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'wallets',
                message: 'Enter the wallets (comma-separated):'
            };
            const statusPrompt: Vorpal.PromptObject = {
                type: 'confirm',
                name: 'status',
                message: 'Enter the whitelist status for all wallets (true or false):'
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
            this.log(`Changing whitelist status for wallets: ${wallets}...`);
            const { signer } = getSignerFromPrivateKey(privateKey);
            await coreChangeWhitelistStatus(signer, walletsStatuses, (wallet: string, isWhitelisted: boolean) => {
                this.log(`Wallet: ${wallet}, Whitelisted: ${isWhitelisted}`);
            });
            this.log(`Whitelist statuses changed.`);
        });
}
