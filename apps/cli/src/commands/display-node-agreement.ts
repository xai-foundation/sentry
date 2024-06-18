import Vorpal from "vorpal";

/**
 * Function to set the rollup address in the Referee contract.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function displayNodeAgreement(cli: Vorpal) {
    cli
        .command('display-node-agreement', 'Display the Sentry Node Agreement')
        .action(async function (this: Vorpal.CommandInstance) {
            this.log(`View the Sentry Node Agreement here https://xai.games/sentry-node-agreement/`);
        });
}
