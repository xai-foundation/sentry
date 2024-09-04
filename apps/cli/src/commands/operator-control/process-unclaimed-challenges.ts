import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey, getSentryWalletsForOperator, processUnclaimedChallenges as processUnclaimedChallengesCore } from "@sentry/core";

/**
 * Function to start processing unclaimed challenges.
 * @param cli - Commander instance
 */
export function processUnclaimedChallenges(cli: Command): void {
    cli
        .command('process-unclaimed-challenges')
        .description('Starts processing unclaimed challenges for the operator.')
        .action(async () => {
            // Prompt user for the private key of the operator
            const { walletKey } = await inquirer.prompt({
                type: 'password',
                name: 'walletKey',
                message: 'Enter the private key of the operator:',
                mask: '*'
            });

            if (!walletKey || walletKey.length < 1) {
                throw new Error("No private key passed in. Please provide a valid private key.");
            }

            const { signer } = getSignerFromPrivateKey(walletKey);

            // Prompt user for whitelist confirmation
            const { useWhitelist } = await inquirer.prompt({
                type: 'confirm',
                name: 'useWhitelist',
                message: 'Do you want to use an allowList for claiming past challenges?',
                default: false
            });

            // If useWhitelist is false, selectedOwners will be undefined
            let selectedOwners: string[] | undefined;
            if (useWhitelist) {
                const operatorAddress = await signer.getAddress();
                const { wallets, pools } = await getSentryWalletsForOperator(operatorAddress);

                const choices: Array<{ name: string; value: string }> = [];

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

                if (!choices.length) {
                    throw new Error(`No operator wallets found for publicKey: ${operatorAddress}. Approve your wallet for operating keys or delegate it to a staking pool to operate for it.`);
                } else {
                    const { selectedOwners: resultSelectedOwners } = await inquirer.prompt({
                        type: 'checkbox',
                        name: 'selectedOwners',
                        message: 'Select the owners/pools for the operator to run for:',
                        choices
                    });

                    selectedOwners = resultSelectedOwners;

                    console.log("selectedOwners:", selectedOwners);

                    if (!selectedOwners || selectedOwners.length < 1) {
                        throw new Error("No owners selected. Please select at least one owner.");
                    }
                }
            }

            try {
                await processUnclaimedChallengesCore(
                    signer,
                    (log: string) => { console.log(log); },
                    selectedOwners
                );
                console.log('Processing of unclaimed challenges started successfully.');
            } catch (error) {
                console.error(`Error processing unclaimed challenges: ${(error as Error).message}`);
            }
        });
}
