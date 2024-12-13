import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey, addPromoCode as coreAddPromoCode, getPromoCode, config, retry } from "@sentry/core";
import fs from 'fs';
import { parse } from "csv/sync";
import { ethers, getAddress, Wallet } from 'ethers';

/**
 * Function to add promo codes from a csv if the signer has the DEFAULT_ADMIN_ROLE.
 * @param cli - Commander instance
 */
export function addPromoCodeList(cli: Command): void {
    cli
        .command('add-promo-code-list')
        .description('Adds a promo code from a csv if the signer has the DEFAULT_ADMIN_ROLE.')
        .action(async () => {

            // Prompt user for the path to the list
            const { pathToList } = await inquirer.prompt({
                type: 'input',
                name: 'pathToList',
                message: 'Enter the absolute path to the promoCode csv (promoCode, receiverAddress) list:',
            });

            if (!fs.existsSync(pathToList)) {
                console.log("Invalid file path, file does not exists", pathToList);
                return;
            }

            //Read the promoCodes and validate
            const promoCodeList = parse(fs.readFileSync(pathToList), { columns: true });

            // Prompt user for the private key of the admin wallet
            const { confirmProceed } = await inquirer.prompt({
                type: 'confirm',
                name: 'confirmProceed',
                message: `Please confirm trying to add ${promoCodeList.length} new codes`,
                default: false
            });

            if (!confirmProceed) {
                console.log("Aborting command.");
                return;
            }

            // Prompt user for the private key of the admin wallet
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key or seed phrase of the admin wallet that will add the promo code:',
                mask: '*',
            });

            if (!privateKey) {
                console.log("Invalid privateKey");
                return;
            }

            var isHex = /[0-9A-Fa-f]{6}/g;

            let signer;

            if (isHex.test(privateKey)) {
                signer = (getSignerFromPrivateKey(privateKey)).signer;
            } else {
                signer = Wallet.fromPhrase(privateKey);
            }

            console.log(`Loaded wallet: ${await signer.getAddress()}`);

            let errorCount = 0;
            let successCount = 0;
            let existingCount = 0;

            console.log(`Loaded ${promoCodeList.length} codes, starting adding...`);

            for (let i = 0; i < promoCodeList.length; i++) {
                const promo = promoCodeList[i];

                if (!promo.promoCode) {
                    console.error(`ERROR: Invalid code in line ${i}`);
                    errorCount++;
                    continue;
                }
                if (!promo.recipient) {
                    console.error(`ERROR: Invalid recipient in line ${i}`);
                    errorCount++;
                    continue;
                }

                const code = promo.promoCode;
                const recipient = promo.recipient.trim();

                try {
                    getAddress(recipient);
                } catch (error) {
                    console.error(`ERROR: Invalid recipient address ${recipient} for code ${code}`);
                    console.error((error as Error).message);
                    errorCount++;
                    continue;
                }

                try {

                    const existingCode = await getPromoCode(code);
                    if (existingCode.recipient != ethers.ZeroAddress) {
                        console.warn(`WARN: Trying to add existing code ${code}, already set to recipient ${existingCode.recipient}`);
                        existingCount++;
                        continue;
                    }

                    // Call the core function to add the promo code
                    const txReceipt = await retry(() => coreAddPromoCode(code, recipient, signer), 3);
                    console.log(`Promo code ${code} for recipient ${recipient} successfully added, view tx: ${config.arbitrumBlockExplorer}/tx/${txReceipt.hash}`);
                    successCount++;

                } catch (error) {
                    console.error(`ERROR: Failed to add promo code ${code} for recipient ${recipient}`);
                    console.error((error as Error).message);
                    errorCount++;
                }

                console.log(`Processed ${i}/${promoCodeList.length}`);
            }

            console.log(`Finished adding ${successCount} codes, errored on ${errorCount}, skipped existing: ${existingCount}`);
        });
}
