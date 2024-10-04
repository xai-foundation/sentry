import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey, removePromoCode as coreRemovePromoCode } from "@sentry/core";

/**
 * Function to remove a promo code if the signer has the DEFAULT_ADMIN_ROLE.
 * @param cli - Commander instance
 */
export function removePromoCode(cli: Command): void {
    cli
        .command('remove-promo-code')
        .description('Removes a promo code if the signer has the DEFAULT_ADMIN_ROLE.')
        .action(async () => {
            // Prompt user for the promo code to remove
            const { promoCode } = await inquirer.prompt({
                type: 'input',
                name: 'promoCode',
                message: 'Enter the promo code to remove:',
            });

            // Prompt user for the private key of the admin wallet
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of the admin wallet that will remove the promo code:',
                mask: '*'
            });

            console.log(`Removing promo code ${promoCode}...`);

            try {
                // Get a signer using the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the core function to remove the promo code
                const txReceipt = await coreRemovePromoCode(promoCode, signer);

                console.log('Promo code successfully removed. Here is the transaction receipt:');
                console.log(`Transaction Receipt: ${JSON.stringify(txReceipt, null, 2)}`);
            } catch (error) {
                console.error(`Error removing promo code: ${(error as Error).message}`);
            }
        });
}
