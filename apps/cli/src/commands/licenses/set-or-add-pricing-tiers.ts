import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey, setOrAddPricingTiers } from "@sentry/core";

/**
 * Function to set or add pricing tiers for node licenses.
 * @param cli - Commander instance
 */
export function setOrAddPricingTiersCommand(cli: Command): void {
    cli
        .command('set-or-add-pricing-tiers')
        .description('Sets or adds a pricing tier.')
        .action(async () => {
            // Prompt user for the private key of an admin
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of an admin:',
                mask: '*'
            });

            // Prompt user for the index of the tier to set or add
            const { index } = await inquirer.prompt({
                type: 'input',
                name: 'index',
                message: 'Enter the index of the tier to set or add:',
                validate: input => isNaN(Number(input)) ? 'Index must be a number' : true
            });

            // Prompt user for the price of the tier
            const { price } = await inquirer.prompt({
                type: 'input',
                name: 'price',
                message: 'Enter the price of the tier:',
                validate: input => isNaN(Number(input)) ? 'Price must be a valid number' : true
            });

            // Prompt user for the quantity of the tier
            const { quantity } = await inquirer.prompt({
                type: 'input',
                name: 'quantity',
                message: 'Enter the quantity of the tier:',
                validate: input => isNaN(Number(input)) ? 'Quantity must be a valid number' : true
            });

            try {
                // Get the signer from the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the setOrAddPricingTiers function
                await setOrAddPricingTiers(Number(index), BigInt(price), BigInt(quantity), signer);

                console.log(`Pricing tier set or added at index: ${index}`);
                console.log(`Price: ${price}`);
                console.log(`Quantity: ${quantity}`);
            } catch (error) {
                console.error(`Error setting or adding pricing tiers: ${(error as Error).message}`);
            }
        });
}
