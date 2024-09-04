import { Command } from 'commander';
import inquirer from 'inquirer';
import Logger from "../../utils/Logger.js";
import {
    getSignerFromPrivateKey,
    operatorRuntime,
    Challenge,
    PublicNodeBucketInformation,
    getSentryWalletsForOperator,
    getSubgraphHealthStatus,
    loadOperatorWalletsFromRPC
} from "@sentry/core";

/**
 * Starts a runtime of the operator.
 * @param cli - Commander instance
 */
export function bootOperator(cli: Command): void {
    let stopFunction: () => Promise<void>;

    cli
        .command('boot-operator')
        .description('Starts a runtime of the operator.')
        .action(async () => {
            // Prompt user for the private key of the operator
            const { walletKey } = await inquirer.prompt({
                type: 'password',
                name: 'walletKey',
                message: 'Enter the private key of the operator:',
                mask: '*',
                validate: input => input.trim() === '' ? 'Private key is required' : true
            });

            if (!walletKey || walletKey.length < 1) {
                throw new Error("No private key passed in. Please provide a valid private key.");
            }

            const { signer } = getSignerFromPrivateKey(walletKey);

            // Prompt user whether to use a whitelist for the operator runtime
            const { useWhitelist } = await inquirer.prompt({
                type: 'confirm',
                name: 'useWhitelist',
                message: 'Do you want to use a whitelist for the operator runtime?',
                default: false
            });

            // If useWhitelist is false, selectedOwners will be undefined
            let selectedOwners;
            if (useWhitelist) {
                const operatorAddress = await signer.getAddress();
                const choices: Array<{ name: string, value: string }> = [];

                const graphStatus = await getSubgraphHealthStatus();
                if (graphStatus.healthy) { // Fetch from subgraph
                    const { wallets, pools } = await getSentryWalletsForOperator(operatorAddress);
                    wallets.forEach(w => {
                        choices.push({
                            name: `Owner: ${w.address}${operatorAddress.toLowerCase() === w.address.toLowerCase() ? " (your wallet)" : ""}`,
                            value: w.address
                        });
                    });
                    pools.forEach(p => {
                        choices.push({
                            name: `Pool: ${p.metadata[0]} (${p.address})`,
                            value: p.address
                        });
                    });
                } else { // Fetch from RPC
                    const res = await loadOperatorWalletsFromRPC(operatorAddress);
                    res.forEach(a => {
                        if (a.isPool) {
                            choices.push({
                                name: `Pool: (${a.address})`,
                                value: a.address
                            });
                        } else {
                            choices.push({
                                name: `Owner: ${a.address}${operatorAddress.toLowerCase() === a.address.toLowerCase() ? " (your wallet)" : ""}`,
                                value: a.address
                            });
                        }
                    });
                }

                if (!choices.length) {
                    throw new Error(`No operatorWallets found for publicKey: ${operatorAddress}, approve your wallet for operating keys or delegate it to a staking pool to operate for it.`);
                } else {
                    const { selectedOwners: ownerSelection } = await inquirer.prompt({
                        type: 'checkbox',
                        name: 'selectedOwners',
                        message: 'Select the owners/pools for the operator to run for:',
                        choices,
                    });

                    selectedOwners = ownerSelection;
                    Logger.log("selectedOwners", selectedOwners);

                    if (!selectedOwners || selectedOwners.length < 1) {
                        throw new Error("No owners selected. Please select at least one owner.");
                    }
                }
            }

            stopFunction = await operatorRuntime(
                signer,
                undefined,
                (log: string) => {
                    if (log.startsWith("Error")) {
                        Logger.error(log);
                    } else {
                        Logger.log(log);
                    }
                },
                selectedOwners,
                (publicNodeData: PublicNodeBucketInformation | undefined, challenge: Challenge, message: string) => {
                    const errorMessage = `The comparison between public node and challenge failed:\n` +
                        `${message}\n\n` +
                        `Public node data:\n` +
                        `${JSON.stringify(publicNodeData, null, 2)}\n\n` +
                        `Challenge data:\n` +
                        `${JSON.stringify(challenge, null, 2)}\n`;

                    console.error(errorMessage);
                }
            );

            // Listen for process termination and call the handler
            process.on('SIGINT', async () => {
                if (stopFunction) {
                    await stopFunction();
                }
                Logger.log(`The operator has been terminated manually.`);
                process.exit();
            });

            // Keep the command running
            await new Promise(resolve => {});
        });
}
