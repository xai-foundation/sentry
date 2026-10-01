import { Command } from 'commander';
import inquirer from 'inquirer';
import { syncEsXaiEmissions } from '@sentry/core';

export function syncEsXaiEmissionsCommand(cli: Command) {
    cli
        .command('sync-esxai-emissions')
        .description('Sync the daily esXAI emission aggregates (Referee challenge rewards) from the subgraph into the MongoDB')
        .option('-u, --uri <uri>', 'MongoDB connection URI')
        .option('-f, --from <date>', 'First UTC day to (re)compute as YYYY-MM-DD, defaults to the first challenge')
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

            let fromTimestamp = 0;
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
                const result = await syncEsXaiEmissions({ mongoUri, fromTimestamp, logFunction: log });
                log(`esXAI emission sync completed: ${result.challenges} challenges into ${result.days} days.`);
            } catch (error) {
                console.error('Error during esXAI emission sync:', error);
                process.exit(1);
            }
        });
}
