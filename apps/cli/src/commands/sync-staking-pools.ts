import { Command } from 'commander';
import inquirer from 'inquirer';
import { poolDataSync } from '@sentry/core';

export function syncStakingPools(program: Command) {
    program
        .command('sync-staking-pools')
        .description('Sync the staking pool db data with the current blockchain configs')
        .action(async () => {
            const mongoUriPrompt = {
                type: 'password',
                name: 'mongoUri',
                message: 'Enter the mongodb connection URI:',
                mask: '*',
            };

            const { mongoUri } = await inquirer.prompt([mongoUriPrompt]);

            // Listen for process termination and call the handler
            process.on('SIGINT', async () => {
                console.log(`[${new Date().toISOString()}] The CentralizationRuntime has been terminated manually.`);
                process.exit();
            });

            await poolDataSync({
                mongoUri,
                logFunction: (message: string) => {
                    console.log(message);
                },
            });

            // Simulate a long-running process to keep the CLI running
            setInterval(() => {
                console.log("Running..."); // Placeholder for actual long-running logic
            }, 5000);
        });
}
