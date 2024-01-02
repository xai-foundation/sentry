import Vorpal from "vorpal";
import { getSignerFromPrivateKey, operatorRuntime, listOwnersForOperator } from "@sentry/core";
import 'dotenv/config'

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const WHITE_LIST = process.env.WHITE_LIST || '';

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

            let walletKey: string;
            if (PRIVATE_KEY !== '') {
                console.log("Private key read from env");
                walletKey = PRIVATE_KEY;
            } else {
                const result = await this.prompt(walletKeyPrompt);
                walletKey = result.walletKey;
            }

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

            let selectedOwners: string[] | undefined;
            if (WHITE_LIST !== '') {
                selectedOwners = WHITE_LIST.split(',');
                console.log("selectedOwners provided using env: ", selectedOwners);
                if (!selectedOwners || selectedOwners.length < 1) {
                    throw new Error("No owners selected. Please select at least one owner.")
                }
            } else {
                const { useWhitelist } = await this.prompt(whitelistPrompt);
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
