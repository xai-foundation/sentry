import Vorpal from "vorpal";
import { getSignerFromPrivateKey, operatorRuntime, listOwnersForOperator } from "@sentry/core";

interface BootOperatorArgs {
    options: {
        walletKey?: string;
        useWhitelist?: boolean;
        owners?: string[];
    };
}
/**
 * Starts a runtime of the operator.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function bootOperator(cli: Vorpal) {
    let stopFunction: () => Promise<void>;

    cli
        .command('boot-operator', 'Starts a runtime of the operator.')
        .option('-k, --wallet-key <walletKey>', 'The private key of the operator.')
        .option('-w, --use-whitelist', 'Flag to use a whitelist for the operator runtime.')
        .option('-o, --owners <owners>', 'A comma-separated list of owners if using a whitelist.', list => list.split(','))
        .action(async function (this: Vorpal.CommandInstance, args: BootOperatorArgs) {
            let walletKey = args.options.walletKey;
            if (!walletKey) {
                const walletKeyPrompt: Vorpal.PromptObject = {
                    type: 'password',
                    name: 'walletKey',
                    message: 'Enter the private key of the operator:',
                    mask: '*'
                };
                const result = await this.prompt(walletKeyPrompt);
                walletKey = result.walletKey;
            }

            if (!walletKey || walletKey.length < 1) {
                throw new Error("No private key passed in. Please provide a valid private key.")
            }

            const { signer } = getSignerFromPrivateKey(walletKey);

            let useWhitelist = args.options.useWhitelist;
            let selectedOwners;
            if (useWhitelist === undefined) {
                const whitelistPrompt: Vorpal.PromptObject = {
                    type: 'confirm',
                    name: 'useWhitelist',
                    message: 'Do you want to use a whitelist for the operator runtime?',
                    default: false
                };
                const result = await this.prompt(whitelistPrompt);
                useWhitelist = result.useWhitelist;
            }

            if (useWhitelist) {
                if (!args.options.owners || args.options.owners.length < 1) {
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
                } else {
                    selectedOwners = args.options.owners;
                }

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
