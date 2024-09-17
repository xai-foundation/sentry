import { Command } from 'commander';
import inquirer from 'inquirer';
import { setKycStatus as coreSetKycStatus, getSignerFromPrivateKey } from "@sentry/core";

/**
 * Function to set the KYC status of a list of wallets in the Referee contract.
 * @param cli - Commander instance
 */
export function setKycStatus(cli: Command): void {
    cli
        .command('set-kyc-status')
        .description('Sets the KYC status of a list of wallets in the Referee contract.')
        .action(async () => {
            // Prompt user for the wallets to set KYC status
            const { wallets } = await inquirer.prompt({
                type: 'input',
                name: 'wallets',
                message: 'Enter the wallets (comma-separated):'
            });

            // Prompt user for the KYC status
            const { status } = await inquirer.prompt({
                type: 'confirm',
                name: 'status',
                message: 'Enter the KYC status for all wallets (true or false):'
            });

            // Prompt user for the private key of an admin
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of an admin:'
            });

            const walletsArray = wallets.split(',').map((wallet: string) => wallet.trim());
            const walletsStatuses = walletsArray.reduce((acc: { [key: string]: boolean }, wallet: string) => ({ ...acc, [wallet]: status }), {});

            console.log(`Setting KYC status for wallets: ${wallets}...`);

            try {
                // Create a signer with the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the setKycStatus function to set the KYC status for each wallet
                await coreSetKycStatus(signer, walletsStatuses, (wallet: string, isKycApproved: boolean) => {
                    console.log(`Wallet: ${wallet}, KYC Approved: ${isKycApproved}`);
                });

                console.log(`KYC statuses set.`);
            } catch (error) {
                console.error(`Failed to set KYC statuses: ${(error as Error).message}`);
            }
        });
}
