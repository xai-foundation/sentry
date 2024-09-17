import { Command } from 'commander';
import inquirer from 'inquirer';
import { dataCentralizationRuntime, sendSlackNotification } from "@sentry/core";

export function startCentralizationRuntime(cli: Command) {
    cli
        .command('start-centralization-runtime')
        .description('Start the data centralization runtime')
        .action(async () => {
            const prompts = [
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
            const { mongoUri, slackWebHookUrl, restartOnCrash } = await inquirer.prompt(prompts);

            async function startRuntime() {
                try {
                    const stopRuntime = await dataCentralizationRuntime({ 
                        mongoUri, 
                        slackWebHookUrl, 
                        logFunction: (log: string) => console.log(log) 
                    });

                    // Listen for process termination and call the handler
                    process.on('SIGINT', async () => {
                        await sendSlackNotification(slackWebHookUrl, `The CentralizationRuntime has been terminated manually @ ${new Date().toISOString()}.`, (log: string) => console.log(log));
                        console.log(`[${new Date().toISOString()}] The CentralizationRuntime has been terminated manually.`);
                        stopRuntime();
                        process.exit();
                    });

                    // Keep the command alive
                    return new Promise<void>(() => {});
                } catch (error: unknown) {
                    let errorMessage = "An unknown error occurred";
                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }
                    console.log(`[${new Date().toISOString()}] The CentralizationRuntime encountered an error: ${errorMessage}`);
                    await sendSlackNotification(slackWebHookUrl, `The CentralizationRuntime encountered an error: ${errorMessage}`, (log: string) => console.log(log));

                    if (restartOnCrash) {
                        console.log(`[${new Date().toISOString()}] Restarting the CentralizationRuntime due to crash.`);
                        const slackMessage = `<!channel> Restarting the CentralizationRuntime due to crash @ ${new Date().toISOString()}.`;
                        await sendSlackNotification(slackWebHookUrl, slackMessage, (log: string) => console.log(log));
                        setTimeout(startRuntime, 5000); // Delay before restarting
                    } else {
                        process.exit(1); // Explicitly exit if restart is not desired
                    }
                }
            }

            await startRuntime();
        });
}