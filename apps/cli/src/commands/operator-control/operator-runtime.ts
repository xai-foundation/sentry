import Vorpal from "vorpal";
import Logger from "../../utils/Logger.js"
import { getSignerFromPrivateKey, operatorRuntime, listOwnersForOperator, Challenge, PublicNodeBucketInformation } from "@sentry/core";
import { getOwnerOrDelegatePools } from "@sentry/core";

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
                const pools = await getOwnerOrDelegatePools(operatorAddress);

                const ownerPrompt: Vorpal.PromptObject = {
                    type: 'checkbox',
                    name: 'selectedOwners',
                    message: 'Select the owners/pools for the operator to run for:',
                    choices: [operatorAddress, ...owners, ...pools]
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
                (log: string) => {
                    if (log.startsWith("Error")) {
                        Logger.error(log);
                        return;
                    }
                    Logger.log(log)
                },
                selectedOwners,
                (publicNodeData: PublicNodeBucketInformation | undefined, challenge: Challenge, message: string) => {
                    const errorMessage = `The comparison between public node and challenge failed:\n` +
                        `${message}\n\n` +
                        `Public node data:\n` +
                        `${JSON.stringify(publicNodeData, null, 2)}\n\n` +
                        `Challenge data:\n` +
                        `${JSON.stringify(challenge, null, 2)}\n`;

                    this.log(errorMessage)
                }
            );
            
            
            // Listen for process termination and call the handler
            process.on('SIGINT', async () => {
                if (stopFunction) {
                    stopFunction();
                }
                Logger.log(`The operator has been terminated manually.`);
                process.exit();
            });

            return new Promise((resolve, reject) => { }); // Keep the command alive
        })
        .cancel(() => {
            if (stopFunction) {
                stopFunction();
            }
        });
}