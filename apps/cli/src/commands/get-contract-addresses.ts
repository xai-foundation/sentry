import Vorpal from "vorpal";
import { config } from "@xai-vanguard-node/core";

/**
 * Function to get all contract addresses from the config and log them in the console.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function getAllContractAddresses(cli: Vorpal) {
    cli
        .command('get-all-contract-addresses', 'Fetches all the contract addresses.')
        .action(async function (this: Vorpal.CommandInstance) {
            const addresses = {
                "ES XAI Address": config.esXaiAddress,
                "Node License Address": config.nodeLicenseAddress,
                "Referee Address": config.refereeAddress,
                "Rollup Address": config.rollupAddress,
                "XAI Address": config.xaiAddress,
                "Gas Subsidy Contract": config.gasSubsidyAddress
            };
            for (const [name, address] of Object.entries(addresses)) {
                this.log(`${name}: ${address}`);
            }
        });
}
