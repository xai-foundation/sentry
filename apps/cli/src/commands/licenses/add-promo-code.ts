import Vorpal from "vorpal";
import { getSignerFromPrivateKey, addPromoCode as coreAddPromoCode } from "@sentry/core";

export function addPromoCode(cli: Vorpal) {
    cli
        .command('add-promo-code', 'Adds a promo code if the signer has the DEFAULT_ADMIN_ROLE.')
        .action(async function (this: Vorpal.CommandInstance) {
            const promoCodePrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'promoCode',
                message: 'Enter the promo code to add:',
            };
            const { promoCode } = await this.prompt(promoCodePrompt);

            const recipientPrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'recipient',
                message: 'Enter the recipient address:',
            };
            const { recipient } = await this.prompt(recipientPrompt);

            const privateKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of the admin wallet that will add the promo code:',
                mask: '*'
            };
            const { privateKey } = await this.prompt(privateKeyPrompt);

            this.log(`Adding promo code ${promoCode}...`);

            // get a signer of the private key
            const {signer} = getSignerFromPrivateKey(privateKey);

            try {
                const txReceipt = await coreAddPromoCode(
                    promoCode,
                    recipient,
                    signer,
                );

                this.log(`Promo code successfully added. Here is the transaction receipt:`);
                this.log(`Transaction Receipt: ${txReceipt}`);
                

            } catch (error) {
                this.log(`Error adding promo code: ${(error as Error).message}`);
            }
        });
}
