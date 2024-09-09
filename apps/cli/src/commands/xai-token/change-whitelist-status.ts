import { Command } from 'commander';
import inquirer from 'inquirer';
import { changeWhitelistStatus as coreChangeWhitelistStatus, getSignerFromPrivateKey } from "@sentry/core";

/**
 * Function to change the whitelist status of a list of wallets in the esXai contract.
 * @param cli - Commander instance
 */
export function changeWhitelistStatus(cli: Command): void {
    cli
        .command('change-whitelist-status')
        .description('Changes the whitelist status of a list of wallets in the esXai contract.')
        .action(async () => {
            // Prompt user for wallets to change whitelist status
            const { wallets } = await inquirer.prompt({
                type: 'input',
                name: 'wallets',
                message: 'Enter the wallets (comma-separated):',
            });

            // Prompt user for whitelist status
            const { status } = await inquirer.prompt({
                type: 'confirm',
                name: 'status',
                message: 'Enter the whitelist status for all wallets (true or false):',
                default: false
            });

            // Prompt user for the private key of an admin
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of an admin:',
                mask: '*'
            });

            const walletsArray = wallets.split(',').map((wallet: string) => wallet.trim());
            const walletsStatuses = walletsArray.reduce((acc: { [key: string]: boolean }, wallet: string) => ({ ...acc, [wallet]: status }), {});

            console.log(`Changing whitelist status for wallets: ${wallets}...`);

            try {
                // Get signer from private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call core function to change whitelist status
                await coreChangeWhitelistStatus(signer, walletsStatuses, (wallet: string, isWhitelisted: boolean) => {
                    console.log(`Wallet: ${wallet}, Whitelisted: ${isWhitelisted}`);
                });

                console.log(`Whitelist statuses changed successfully.`);
            } catch (error) {
                console.error(`Error changing whitelist statuses: ${(error as Error).message}`);
            }
        });
}
