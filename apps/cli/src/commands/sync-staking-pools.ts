import Vorpal from "vorpal";
import { poolDataSync } from "@sentry/core";

export function syncStakingPools(cli: Vorpal) {
    cli
        .command('sync-staking-pools', 'Sync the staking pool db data with the current blockchain configs')
        .action(async function (this: Vorpal.CommandInstance) {

            const commandInstance = this;

            const mongoUriPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'mongoUri',
                message: 'Enter the mongodb connection URI:',
                mask: '*',
                optional: false
            };
            const { mongoUri } = await this.prompt(mongoUriPrompt);

            // Listen for process termination and call the handler
            process.on('SIGINT', async () => {
                commandInstance.log(`[${new Date().toISOString()}] The CentralizationRuntime has been terminated manually.`);
                process.exit();
            });

            await poolDataSync({ mongoUri, logFunction: (message: string) => { commandInstance.log(message) } });

        });
}