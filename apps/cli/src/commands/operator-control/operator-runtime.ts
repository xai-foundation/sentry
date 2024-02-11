import Vorpal from "vorpal";
import { getSignerFromPrivateKey, operatorRuntime, listOwnersForOperator, Challenge, PublicNodeBucketInformation } from "@sentry/core";

/**
 * Starts a runtime of the operator.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function bootOperator(cli: Vorpal) {
    let stopFunction: () => Promise<void>;

    cli
        .command('boot-operator', 'Starts a runtime of the operator.')
        .option('--walletKey [walletKey]', 'Private key of the operator')
        .option('--useWhitelist [useWhitelist]', 'Flag to use a whitelist for the operator runtime')
        .option('--owners [owners]', 'Comma separated list of owners to include in the whitelist')
        .action(async function (this: Vorpal.CommandInstance, args: any) {
            let { walletKey } = args.options;

            if (!walletKey) {
                const walletKeyPrompt: Vorpal.PromptObject = {
                    type: 'password',
                    name: 'walletKey',
                    message: 'Enter the private key of the operator:',
                    mask: '*'
                };
                const { result } = await this.prompt(walletKeyPrompt);
                walletKey = result.walletKey;
            }

            if (!walletKey || walletKey.length < 1) {
                throw new Error("No private key passed in. Please provide a valid private key.")
            }

            const { signer } = getSignerFromPrivateKey(walletKey);

            let { useWhitelist } = args.options;
            if (useWhitelist) {
                useWhitelist = (useWhitelist === 'true' || useWhitelist === true);
            } else {
                const whitelistPrompt: Vorpal.PromptObject = {
                    type: 'confirm',
                    name: 'useWhitelist',
                    message: 'Do you want to use a whitelist for the operator runtime?',
                    default: false
                };
                const result = await this.prompt(whitelistPrompt);
                useWhitelist = result.useWhitelist;
            }

            let selectedOwners;
            if (useWhitelist) {
                if (args.options.owners) {
                    selectedOwners = args.options.owners.split(',');
                } else {
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
                }

                console.log("selectedOwners", selectedOwners);

                if (!selectedOwners || selectedOwners.length < 1) {
                    throw new Error("No owners selected. Please select at least one owner.")
                }
            }

            stopFunction = await operatorRuntime(
                signer,
                undefined,
                (log: string) => this.log(log),
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

            return new Promise((resolve, reject) => { }); // Keep the command alive
        })
        .cancel(() => {
            if (stopFunction) {
                stopFunction();
            }
        });
}