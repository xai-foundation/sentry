import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey, addPromoCode as coreAddPromoCode } from "@sentry/core";

/**
 * Function to add a promo code if the signer has the DEFAULT_ADMIN_ROLE.
 * @param cli - Commander instance
 */
export function addPromoCode(cli: Command): void {
    cli
        .command('add-promo-code')
        .description('Adds a promo code if the signer has the DEFAULT_ADMIN_ROLE.')
        .action(async () => {
            // Prompt user for the promo code to add
            const { promoCode } = await inquirer.prompt({
                type: 'input',
                name: 'promoCode',
                message: 'Enter the promo code to add:',
            });

            // Prompt user for the recipient address
            const { recipient } = await inquirer.prompt({
                type: 'input',
                name: 'recipient',
                message: 'Enter the recipient address:',
            });

            // Prompt user for the private key of the admin wallet
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of the admin wallet that will add the promo code:',
                mask: '*',
            });

            console.log(`Adding promo code ${promoCode}...`);

            try {
                // Get a signer using the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the core function to add the promo code
                const txReceipt = await coreAddPromoCode(promoCode, recipient, signer);

                console.log('Promo code successfully added. Here is the transaction receipt:');
                console.log(`Transaction Receipt: ${JSON.stringify(txReceipt, null, 2)}`);
                
            } catch (error) {
                console.error(`Error adding promo code: ${(error as Error).message}`);
            }
        });
}
