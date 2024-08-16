import Vorpal from "vorpal";
import { getSignerFromPrivateKey, getSentryWalletsForOperator, processUnclaimedChallenges as processUnclaimedChallengesCore } from "@sentry/core";

/**
 * Starts a runtime of the operator.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function processUnclaimedChallenges(cli: Vorpal) {
    cli
        .command('process-unclaimed-challenges', 'Starts a runtime of the operator.')
        .action(async function (this: Vorpal.CommandInstance) {

            const cmdInstance = this;

            const walletKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'walletKey',
                message: 'Enter the private key of the operator:',
                mask: '*'
            };

            const { walletKey } = await this.prompt(walletKeyPrompt);

            if (!walletKey || walletKey.length < 1) {
                throw new Error("No private key passed in. Please provide a valid private key.")
            }

            const { signer } = getSignerFromPrivateKey(walletKey);

            const whitelistPrompt: Vorpal.PromptObject = {
                type: 'confirm',
                name: 'useWhitelist',
                message: 'Do you want to use a allowList for claiming past challenges?',
                default: false
            };

            const { useWhitelist } = await this.prompt(whitelistPrompt);

            // If useWhitelist is false, selectedOwners will be undefined
            let selectedOwners;
            if (useWhitelist) {

                const operatorAddress = await signer.getAddress();
                const { wallets, pools } = await getSentryWalletsForOperator(operatorAddress);

                const choices: Array<{ name: string, value: string }> = [];

                wallets.forEach(w => {
                    choices.push({
                        name: `Owner: ${w.address}${operatorAddress.toLowerCase() == w.address.toLowerCase() ? " (your wallet)" : ""}`,
                        value: w.address
                    })
                })

                pools.forEach(p => {
                    choices.push({
                        name: `Pool: ${p.metadata[0]} (${p.address})`,
                        value: p.address
                    })
                })

                const ownerPrompt: Vorpal.PromptObject = {
                    type: 'checkbox',
                    name: 'selectedOwners',
                    message: 'Select the owners/pools for the operator to run for:',
                    choices,
                };

                if (!choices.length) {
                    throw new Error(`No operatorWallets found for publicKey: ${operatorAddress}, approve your wallet for operating keys or delegate it to a staking pool to operate for it.`)
                } else {
                    const result = await this.prompt(ownerPrompt);
                    selectedOwners = result.selectedOwners;

                    cmdInstance.log("selectedOwners", selectedOwners);

                    if (!selectedOwners || selectedOwners.length < 1) {
                        throw new Error("No owners selected. Please select at least one owner.")
                    }
                }
            }

            await processUnclaimedChallengesCore(
                signer,
                (log: string) => { cmdInstance.log(log) },
                selectedOwners
            );
        })
}