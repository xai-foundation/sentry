import { Command } from 'commander';
import inquirer from 'inquirer';
import { nodeCreatedMonitor, sendSlackNotification } from "@sentry/core";

/**
 * Function to start a runtime for an event monitor.
 * @param cli - Commander instance
 */
export function monitorNodeCreated(cli: Command): void {
    cli
        .command('monitor-node-created')
        .description("Starts a runtime to monitor the Rollup's NodeCreated event and send channel notifications.")
        .action(async () => {
            try {
                // Prompt user for the webhook URL
                const { webhookUrl } = await inquirer.prompt({
                    type: 'password',
                    name: 'webhookUrl',
                    message: 'Enter the webhook URL for the monitor notification channel:',
                    mask: '*',
                    validate: input => input.trim() === '' ? 'Webhook URL is required' : true
                });

                const logCallback = (log: string) => {
                    console.log(log);
                };

                console.log('Starting the NodeCreated monitor...');

                // Start the node created monitor
                await nodeCreatedMonitor(webhookUrl, logCallback);

                // Listen for process termination and call the handler
                process.on('SIGINT', async () => {
                    console.log(`The NodeCreated monitor has been terminated manually.`);
                    await sendSlackNotification(webhookUrl, `<!channel> The NodeCreated monitor has been terminated manually.`, logCallback);
                    process.exit();
                });

            } catch (error) {
                console.error(`Error starting the monitor: ${(error as Error).message}`);
            }
        });
}
