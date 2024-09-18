import { Command } from 'commander';
import { listAddressesForRole } from "@sentry/core";

/**
 * Registers the 'get-list-of-kyc-admins' command with the provided CLI instance.
 * @param cli - The commander CLI instance.
 */
export function getListOfKycAdmins(cli: Command): void {
    cli
        .command('get-list-of-kyc-admins')
        .description('Lists all addresses that have the KYC admin role.')
        .action(async () => {
            console.log(`Fetching all addresses with the KYC admin role...`);
            
            try {
                const addresses = await listAddressesForRole('KYC_ADMIN_ROLE');
                console.log(`Addresses retrieved. Here are the details:`);
                addresses.forEach((address: string, index: number) => {
                    console.log(`Address ${index + 1}: ${address}`);
                });
            } catch (error) {
                console.error(`Failed to fetch addresses: ${(error as Error).message}`);
            }
        });
}
