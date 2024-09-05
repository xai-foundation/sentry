import { Command } from 'commander';
import inquirer from 'inquirer';
import { poolDataSync } from '@sentry/core';

export function syncStakingPools(cli: Command) {
    cli
        .command('sync-staking-pools')
        .description('Sync the staking pool db data with the current blockchain configs')
        .option('-u, --uri <uri>', 'MongoDB connection URI')
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

            console.log('Starting staking pool sync...');

            try {
                await poolDataSync({
                    mongoUri,
                    logFunction: (message: string) => {
                        console.log(`[${new Date().toISOString()}] ${message}`);
                    },
                });
                console.log('Staking pool sync completed successfully.');
            } catch (error) {
                console.error('Error during staking pool sync:', error);
                process.exit(1);
            }
        });
}

// Listen for process termination globally
process.on('SIGINT', () => {
    console.log(`\n[${new Date().toISOString()}] Process terminated manually.`);
    process.exit(0);
});