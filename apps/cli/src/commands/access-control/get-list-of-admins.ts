import { Command } from 'commander';
import { listAddressesForRole } from "@sentry/core";

export function getListOfAdmins(cli: Command) {
    cli
        .command('get-list-of-admins')
        .description('Lists all addresses that have the admin role.')
        .action(async () => {
            try {
                console.log(`Fetching all addresses with the admin role...`);
                const addresses = await listAddressesForRole('DEFAULT_ADMIN_ROLE');
                console.log(`Addresses retrieved. Here are the details:`);
                addresses.forEach((address: string, index: number) => {
                    console.log(`Address ${index + 1}: ${address}`);
                });
            } catch (error) {
                console.error('An error occurred while fetching the admin addresses:', error instanceof Error ? error.message : error);
            }
        });
}
