import Vorpal from "vorpal";
import { dataCentralizationRuntime } from "@sentry/core";

export function startCentralizationRuntime(cli: Vorpal) {
    cli
        .command('start-centralization-runtime', 'Start the data centralization runtime')
        .action(async function (this: Vorpal.CommandInstance) {
            const mongoUriPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'mongoUri',
                message: 'Enter the mongodb connection URI:',
                mask: '*',
                optional: false
            };
            const { mongoUri } = await this.prompt(mongoUriPrompt);

            const commandInstance = this;

            const stopRuntime = await dataCentralizationRuntime({ mongoUri, logFunction: (log: string) => commandInstance.log(log) });

            // Listen for process termination and call the handler
            process.on('SIGINT', async () => {
                commandInstance.log(`[${new Date().toISOString()}] The CentralizationRuntime has been terminated manually.`);
                stopRuntime();
                process.exit();
            });

            return new Promise((resolve, reject) => { }); // Keep the command alive
        });
}