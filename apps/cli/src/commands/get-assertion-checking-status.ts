import { Command } from 'commander';
import { getIsCheckingAssertions } from "@sentry/core";

/**
 * Function to fetch the current status of assertion checking.
 * @param cli - Commander instance
 */
export function getAssertionCheckingStatus(cli: Command): void {
    cli
        .command('get-assertion-checking-status')
        .description('Fetches the current status of assertion checking.')
        .action(async () => {
            console.log('Fetching the current status of assertion checking...');

            try {
                const isCheckingAssertions = await getIsCheckingAssertions();
                console.log(`Assertion checking status: ${isCheckingAssertions ? 'Enabled' : 'Disabled'}`);
            } catch (error) {
                console.error(`Error fetching assertion checking status: ${(error as Error).message}`);
            }
        });
}
