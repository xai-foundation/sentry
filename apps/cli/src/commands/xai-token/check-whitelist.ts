import Vorpal from "vorpal";import { checkWhitelist as coreCheckWhitelist } from "@xai-vanguard-node/core";

/**
 * Function to check the whitelist status of a list of wallets in the esXai contract.
 * @param cli - Vorpal instance
 */
export function checkWhitelist(cli: Vorpal) {
    cli
        .command('check-whitelist', 'Checks the whitelist status of a list of wallets in the esXai contract. Wallets should be provided as a comma-separated list.')
        .action(async function (this: Vorpal.CommandInstance) {
            const walletsPrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'wallets',
                message: 'Enter the wallets (comma-separated):'
            };
            const {wallets} = await this.prompt(walletsPrompt);
            const walletsArray = wallets.split(',').map((wallet: string) => wallet.trim());
            this.log(`Checking whitelist status for wallets: ${wallets}...`);
            await coreCheckWhitelist(walletsArray, (wallet: string, isWhitelisted: boolean) => {
                this.log(`Wallet: ${wallet}, Whitelisted: ${isWhitelisted}`);
            });
            this.log(`Whitelist statuses retrieved.`);
        });
}
