import Vorpal from "vorpal";
import { getSignerFromPrivateKey, removePromoCode as coreRemovePromoCode } from "@sentry/core";

export function removePromoCode(cli: Vorpal) {
    cli
        .command('remove-promo-code', 'Removes a promo code if the signer has the DEFAULT_ADMIN_ROLE.')
        .action(async function (this: Vorpal.CommandInstance) {
            const promoCodePrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'promoCode',
                message: 'Enter the promo code to remove:',
            };
            const { promoCode } = await this.prompt(promoCodePrompt);

            const privateKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of the admin wallet that will remove the promo code:',
                mask: '*'
            };
            const { privateKey } = await this.prompt(privateKeyPrompt);

            this.log(`Removing promo code ${promoCode}...`);

            // get a signer of the private key
            const {signer} = getSignerFromPrivateKey(privateKey);

            try {
                const txReceipt = await coreRemovePromoCode(
                    promoCode,
                    signer,
                );

                this.log(`Promo code successfully removed. Here is the transaction receipt:`);
                this.log(`Transaction Receipt: ${txReceipt}`);
                

            } catch (error) {
                this.log(`Error removing promo code: ${(error as Error).message}`);
            }
        });
}
