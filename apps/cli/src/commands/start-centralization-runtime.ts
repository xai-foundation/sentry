import Vorpal from "vorpal";
import { dataCentralizationRuntime, sendSlackNotification } from "@sentry/core";

/**
 * Starts the data centralization runtime.
 * @param {Vorpal} cli - The Vorpal CLI instance.
 */
export function startCentralizationRuntime(cli: Vorpal): void {
    cli
        .command('start-centralization-runtime', 'Start the data centralization runtime')
        .action(async function (this: Vorpal.CommandInstance) {
            const { mongoUri, slackWebHookUrl, restartOnCrash } = await getUserInput(this);
            await runCentralizationRuntime(this, mongoUri, slackWebHookUrl, restartOnCrash);
        });
}

interface UserInput {
    mongoUri: string;
    slackWebHookUrl: string;
    restartOnCrash: boolean;
    simulateErrorAfter: number;
}

/**
 * Prompts the user for input.
 * @param {Vorpal.CommandInstance} commandInstance - The Vorpal command instance.
 * @returns {Promise<UserInput>}
 */
async function getUserInput(commandInstance: Vorpal.CommandInstance): Promise<UserInput> {
    const prompts: Vorpal.PromptObject[] = [
        {
            type: 'password',
            name: 'mongoUri',
            message: 'Enter the mongodb connection URI:',
            mask: '*',
        },
        {
            type: 'input',
            name: 'slackWebHookUrl',
            message: 'Enter the Slack Webhook Notifications URL:',
        },
        {
            type: 'confirm',
            name: 'restartOnCrash',
            message: 'Do you want to restart the runtime on crash?',
            default: false,
        }
    ];

    const result = await commandInstance.prompt(prompts) as UserInput;
    result.simulateErrorAfter = parseInt(result.simulateErrorAfter as unknown as string);
    return result;
}

/**
 * Runs the centralization runtime in an infinite loop.
 * @param {Vorpal.CommandInstance} commandInstance - The Vorpal command instance.
 * @param {string} mongoUri - MongoDB connection URI.
 * @param {string} slackWebHookUrl - Slack webhook URL for notifications.
 * @param {boolean} restartOnCrash - Whether to restart on crash.
 * @param {number} simulateErrorAfter - Number of seconds after which to simulate an error.
 */
async function runCentralizationRuntime(
    commandInstance: Vorpal.CommandInstance,
    mongoUri: string,
    slackWebHookUrl: string,
    restartOnCrash: boolean
): Promise<void> {
    //const simulateErrorAfterSeconds = 10; // For testing restart on crash
    while (true) {
        try {
            const stopRuntime = await dataCentralizationRuntime({
                mongoUri,
                slackWebHookUrl,
                logFunction: (log: string) => commandInstance.log(log)
            });

            setupTerminationHandler(commandInstance, slackWebHookUrl, stopRuntime);

            // For testing restart on crash
            // if (simulateErrorAfterSeconds > 0) {
            //     await simulateError(simulateErrorAfterSeconds);
            // }

            // Keep the runtime alive
            await new Promise(() => { });
        } catch (error) {
            await handleRuntimeError(commandInstance, slackWebHookUrl, error);

            if (!restartOnCrash) {
                commandInstance.log('Restart on crash is disabled. Exiting...');
                process.exit(1);
            }

            commandInstance.log('Restarting in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

/**
 * Sets up a handler for manual termination of the runtime.
 * @param {Vorpal.CommandInstance} commandInstance - The Vorpal command instance.
 * @param {string} slackWebHookUrl - Slack webhook URL for notifications.
 * @param {Function} stopRuntime - Function to stop the runtime.
 */
function setupTerminationHandler(
    commandInstance: Vorpal.CommandInstance,
    slackWebHookUrl: string,
    stopRuntime: () => void
): void {
    process.on('SIGINT', async () => {
        const terminationMessage = `The CentralizationRuntime has been terminated manually @ ${new Date().toISOString()}.`;
        await sendSlackNotification(slackWebHookUrl, terminationMessage, (log: string) => commandInstance.log(log));
        commandInstance.log(`[${new Date().toISOString()}] ${terminationMessage}`);
        stopRuntime();
        process.exit(0);
    });
}

/**
 * Handles runtime errors.
 * @param {Vorpal.CommandInstance} commandInstance - The Vorpal command instance.
 * @param {string} slackWebHookUrl - Slack webhook URL for notifications.
 * @param {unknown} error - The error that occurred.
 */
async function handleRuntimeError(
    commandInstance: Vorpal.CommandInstance,
    slackWebHookUrl: string,
    error: unknown
): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    const logMessage = `[${new Date().toISOString()}] The CentralizationRuntime encountered an error: ${errorMessage}`;
    commandInstance.log(logMessage);
    await sendSlackNotification(slackWebHookUrl, logMessage, (log: string) => commandInstance.log(log));
}

/**
 * Simulates an error after a specified number of seconds.
 * @param {number} seconds - Number of seconds after which to simulate an error.
 * @returns {Promise<never>} - A promise that rejects with the simulated error.
 */
// function simulateError(seconds: number): Promise<never> {
//     return new Promise((_, reject) => {
//         setTimeout(() => {
//             reject(new Error(`Simulated error after ${seconds} seconds`));
//         }, seconds * 1000);
//     });
// }