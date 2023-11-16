import Vorpal from "vorpal";
import { getSignerFromPrivateKey, setOrAddPricingTiers } from "@sentry/core";

/**
 * Function to set or add pricing tiers for node licenses.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function setOrAddPricingTiersCommand(cli: Vorpal) {
    cli
        .command('set-or-add-pricing-tiers', 'Sets or adds a pricing tier.')
        .action(async function (this: Vorpal.CommandInstance) {
            const privateKeyPrompt = {
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of an admin:',
            };
            const indexPrompt = {
                type: 'input',
                name: 'index',
                message: 'Enter the index of the tier to set or add:'
            };
            const pricePrompt = {
                type: 'input',
                name: 'price',
                message: 'Enter the price of the tier:'
            };
            const quantityPrompt = {
                type: 'input',
                name: 'quantity',
                message: 'Enter the quantity of the tier:'
            };
            const { privateKey, index, price, quantity } = await this.prompt([privateKeyPrompt, indexPrompt, pricePrompt, quantityPrompt]);

            // Get the signer from the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the setOrAddPricingTiers function
            await setOrAddPricingTiers(index, BigInt(price), BigInt(quantity), signer);

            this.log(`Pricing tier set or added at index: ${index}`);
            this.log(`Price: ${price}`);
            this.log(`Quantity: ${quantity}`);
        });
}
