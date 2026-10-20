import { Command } from 'commander';
import inquirer from 'inquirer';
import { syncSentryKeySales } from '@sentry/core';

export function syncSentryKeySalesCommand(cli: Command) {
    cli
        .command('sync-sentry-key-sales')
        .description('Sync the daily Sentry Key sale aggregates (NodeLicense mints without the tiny keys airdrop) from the subgraph into the MongoDB')
        .option('-u, --uri <uri>', 'MongoDB connection URI')
        .option('-f, --from <date>', 'First UTC day to (re)compute as YYYY-MM-DD, defaults to the first key mint')
        .action(async (options) => {
            let mongoUri = options.uri;

            if (!mongoUri) {
                const mongoUriPrompt = {
                    type: 'password',
                    name: 'mongoUri',
                    message: 'Enter the MongoDB connection URI:',
                    mask: '*',
                    optional: false
                };

                ({ mongoUri } = await inquirer.prompt([mongoUriPrompt]));
            }

            let fromTimestamp: number | undefined;
            if (options.from) {
                const parsed = Date.parse(`${options.from}T00:00:00Z`);
                if (Number.isNaN(parsed)) {
                    console.error(`Invalid --from date "${options.from}", expected YYYY-MM-DD`);
                    process.exit(1);
                }
                fromTimestamp = Math.floor(parsed / 1000);
            }

            const log = (message: string) => console.log(`[${new Date().toISOString()}] ${message}`);

            try {
                const result = await syncSentryKeySales({ mongoUri, fromTimestamp, logFunction: log });
                log(`Sentry Key sale sync completed: ${result.keys} keys into ${result.days} days.`);
            } catch (error) {
                console.error('Error during Sentry Key sale sync:', error);
                process.exit(1);
            }
        });
}
