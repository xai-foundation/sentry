import Vorpal from "vorpal";
import { dataCentralizationRuntime, sendSlackNotification } from "@sentry/core";

export function startCentralizationRuntime(cli: Vorpal) {
    cli
        .command('start-centralization-runtime', 'Start the data centralization runtime')
        .action(async function (this: Vorpal.CommandInstance) {
            const prompts: Vorpal.PromptObject[] = [
                {
                    type: 'password',
                    name: 'mongoUri',
                    message: 'Enter the mongodb connection URI:',
                    mask: '*',
                    optional: false
                },
                {
                    type: 'input',
                    name: 'slackWebHookUrl',
                    message: 'Enter the Slack Webhook Notifications URL:',
                    optional: false
                },
                {
                    type: 'confirm',
                    name: 'restartOnCrash',
                    message: 'Do you want to restart the runtime on crash?',
                    default: false
                }
            ];
            const { mongoUri, slackWebHookUrl, restartOnCrash } = await this.prompt(prompts);

            const commandInstance = this;

            async function startRuntime() {
                try {
                    const stopRuntime = await dataCentralizationRuntime({ mongoUri, slackWebHookUrl, logFunction: (log: string) => commandInstance.log(log) });

                    // Listen for process termination and call the handler
                    process.on('SIGINT', async () => {
                        await sendSlackNotification(slackWebHookUrl, `The CentralizationRuntime has been terminated manually @ ${new Date().toISOString()}.`, (log: string) => commandInstance.log(log) );
                        commandInstance.log(`[${new Date().toISOString()}] The CentralizationRuntime has been terminated manually.`);
                        stopRuntime();
                        process.exit();
                    });

                    // Keep the command alive
                    return new Promise((resolve, reject) => { });
                } catch (error: unknown) {
                    let errorMessage = "An unknown error occurred";
                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }
                    commandInstance.log(`[${new Date().toISOString()}] The CentralizationRuntime encountered an error: ${errorMessage}`);
                    await sendSlackNotification(slackWebHookUrl, `The CentralizationRuntime encountered an error: ${errorMessage}`, (log: string) => commandInstance.log(log));

                    if (restartOnCrash) {
                        commandInstance.log(`[${new Date().toISOString()}] Restarting the CentralizationRuntime due to crash.`);
                        await sendSlackNotification(slackWebHookUrl, `Restarting the CentralizationRuntime due to crash.`, (log: string) => commandInstance.log(log));
                        setTimeout(startRuntime, 5000); // Delay before restarting
                    }
                }
            }

            await startRuntime();
        });
}
