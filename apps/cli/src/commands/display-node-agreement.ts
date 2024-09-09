import { Command } from 'commander';

/**
 * Function to display the Sentry Node Agreement.
 * @param cli - Commander instance
 */
export function displayNodeAgreement(cli: Command): void {
    cli
        .command('display-node-agreement')
        .description('Display the Sentry Node Agreement')
        .action(() => {
            console.log('View the Sentry Node Agreement here: https://xai.games/sentry-node-agreement/');
        });
}
