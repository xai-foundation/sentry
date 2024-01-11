import Vorpal from "vorpal";
import { getSignerFromPrivateKey, operatorRuntime, listOwnersForOperator } from "@sentry/core";

/**
 * Starts a runtime of the operator.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function bootOperator(cli: Vorpal) {
    let stopFunction: () => Promise<void>;

    cli
        .command('boot-operator', 'Starts a runtime of the operator.')
        .action(async function (this: Vorpal.CommandInstance) {
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
                message: 'Do you want to use a whitelist for the operator runtime?',
                default: false
            };

            const { useWhitelist } = await this.prompt(whitelistPrompt);

            // If useWhitelist is false, selectedOwners will be undefined
            let selectedOwners;
            if (useWhitelist) {
                
                const operatorAddress = await signer.getAddress();
                const owners = await listOwnersForOperator(operatorAddress);

                const ownerPrompt: Vorpal.PromptObject = {
                    type: 'checkbox',
                    name: 'selectedOwners',
                    message: 'Select the owners for the operator to run for:',
                    choices: [operatorAddress, ...owners]
                };

                const result = await this.prompt(ownerPrompt);
                selectedOwners = result.selectedOwners;

                console.log("selectedOwners", selectedOwners);

                if (!selectedOwners || selectedOwners.length < 1) {
                    throw new Error("No owners selected. Please select at least one owner.")
                }
            }


            stopFunction = await operatorRuntime(
                signer,
                undefined,
                (log) => this.log(log),
                selectedOwners,
            );

            return new Promise((resolve, reject) => { }); // Keep the command alive
        })
        .cancel(() => {
            if (stopFunction) {
                stopFunction();
            }
        });
}