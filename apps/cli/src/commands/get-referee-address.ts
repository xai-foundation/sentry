import * as Vorpal from "vorpal";
import { config } from "@xai-vanguard-node/core";

/**
 * Function to get the referee contract address from the config and log it in the console.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function getRefereeContractAddress(cli: Vorpal) {
    cli
        .command('get-referee-contract-address', 'Fetches the referee contract address.')
        .action(async function (this: Vorpal.CommandInstance) {
            const refereeContractAddress = config.refereeContractAddress;
            this.log(`Referee Contract Address: ${refereeContractAddress}`);
        });
}
