import Vorpal from "vorpal";
import { nodeCreatedMonitor, sendSlackNotification } from "@sentry/core";

/**
 * Starts a runtime for an event monitor.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function monitorNodeCreated(cli: Vorpal) {

    cli
        .command('monitor-node-created', "Starts a runtime to monitor the Rollup's NodeCreated event and send channel notifications.")
        .action(async function (this: Vorpal.CommandInstance) {

            const commandInstance = this;

            const { webhookUrl }: any = await commandInstance.prompt({
                type: 'password',
                name: 'webhookUrl',
                message: 'Enter the webhook URL for the monitor notification channel: ',
                mask: '*'
            });

            if (!webhookUrl || !webhookUrl.length) {
                throw new Error("No webhook URL passed in. Please provide a webhook URL for the monitor notification channel.")
            }

            const logCallback = (log: string) => {
                commandInstance.log(log);
            }

            // Listen for process termination and call the handler
            process.on('SIGINT', async () => {
                commandInstance.log(`The NodeCreated monitor has been terminated manually.`);
                await sendSlackNotification(webhookUrl, `<!channel> The NodeCreated monitor has been terminated manually.`, logCallback);
                process.exit();
            });

            await nodeCreatedMonitor(webhookUrl, logCallback);
        });
}