import Vorpal from "vorpal";import { getSignerFromPrivateKey, toggleAssertionChecking as coreToggleAssertionChecking } from "@sentry/core";

/**
 * Function to toggle the assertion checking in the Referee contract.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function toggleAssertionChecking(cli: Vorpal) {
    cli
        .command('toggle-assertion-checking', 'Toggles the assertion checking.')
        .action(async function (this: Vorpal.CommandInstance) {
            const privateKeyPrompt = {
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of an admin:',
            };
            const { privateKey } = await this.prompt([privateKeyPrompt]);

            // Get the signer from the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the toggleAssertionChecking function
            await coreToggleAssertionChecking(signer);

            this.log(`Assertion checking toggled.`);
        });
}
