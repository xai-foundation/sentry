import * as Vorpal from "vorpal";
import { config } from "@xai-vanguard-node/core";

/**
 * Function to get the node license contract address from the config and log it in the console.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function getNodeLicenseContractAddress(cli: Vorpal) {
    cli
        .command('get-node-license-contract-address', 'Fetches the node license contract address.')
        .action(async function (this: Vorpal.CommandInstance) {
            const nodeLicenseContractAddress = config.nodeLicenseAddress;
            this.log(`Node License Contract Address: ${nodeLicenseContractAddress}`);
        });
}
