import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey, bulkMintNodeLicenses as coreBulkMintNodeLicenses, getPriceForQuantity, NodeLicenseAbi, getEthXaiExchangeRate } from "@sentry/core";
import { config, XaiAbi, esXaiAbi } from '@sentry/core';

/**
 * Function to mint NodeLicense tokens if the signer has enough balance and the amount is less than the maximum mint amount.
 * @param cli - Commander instance
 */
export function mintNodeLicenses(cli: Command): void {
    cli
        .command('bulk-mint-node-licenses')
        .description('Bulk mints NodeLicense tokens in batches to purchase a large amount of keys quickly without confirmation. Recommended for people purchasing 1000s of keys.')
        .action(async () => {

            // Prompt user for the private key of the wallet
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Enter your private key that you want to mint with',
                mask: '*'
            });

            // Get a signer using the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Get the signer's address
            const address = await signer.getAddress();

            // Get the provider from the signer
            const provider = signer.provider;

            if (!provider) {
                throw new Error('Signer does not have a valid provider');
            }

            // Create contract instances for XAI and esXAI
            const xaiContract = new ethers.Contract(config.xaiAddress, XaiAbi, provider);
            const esXaiContract = new ethers.Contract(config.esXaiAddress, esXaiAbi, provider);

            // Get balances for aETH, XAI, and esXAI
            const aEthBalance = await provider.getBalance(address);
            const xaiBalance = await xaiContract.balanceOf(address);
            const esXaiBalance = await esXaiContract.balanceOf(address);

            // Prompt user for the payment method
            const { paymentMethod } = await inquirer.prompt({
                type: 'list',
                name: 'paymentMethod',
                message: 'You can mint in aETH, XAI or esXAI. Select which currency you would like to mint in and then hit enter.',
                choices: [
                    { name: `aETH balance: ${ethers.formatEther(aEthBalance)}`, value: 'eth' },
                    { name: `XAI balance: ${ethers.formatEther(xaiBalance)}`, value: 'xai' },
                    { name: `esXAI balance: ${ethers.formatEther(esXaiBalance)}`, value: 'esXai' }
                ]
            });

            // Prompt user for the promo code (optional)
            const { promoCode } = await inquirer.prompt({
                type: 'input',
                name: 'promoCode',
                message: 'Enter the promo code (optional):',
                default: '',
            });

            // get the price of 1 node license
            const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, signer);
            const price = await nodeLicenseContract.price(1, promoCode ? promoCode : "");

            // if we are using xai or esxai, we need to get the exchange rate
            let exchangeRate: bigint = 1n;
            if (paymentMethod === 'xai' || paymentMethod === 'esXai') {
                const { exchangeRate: exchangeRateFromXai } = await getEthXaiExchangeRate();
                exchangeRate = exchangeRateFromXai;
            }

            // calculate the price of 1 node license in the selected currency
            const priceInSelectedCurrency = price * exchangeRate;

            // Calculate the maximum amount of tokens the user can purchase based on their balance and selected payment method
            let maxPurchasable: bigint;
            if (paymentMethod === 'eth') {
                maxPurchasable = aEthBalance / priceInSelectedCurrency;
            } else if (paymentMethod === 'xai') {
                maxPurchasable = xaiBalance / priceInSelectedCurrency;
            } else {
                maxPurchasable = esXaiBalance / priceInSelectedCurrency;
            }

            // Round down the maximum purchasable amount
            maxPurchasable = maxPurchasable - (maxPurchasable % 1n);

            // Prompt user for the amount of tokens to mint
            const { amount } = await inquirer.prompt({
                type: 'input',
                name: 'amount',
                message: `Enter the amount of tokens to mint (Max: ${maxPurchasable.toString()}):\nNote: The displayed maximum purchasable amount is based on current prices. Prices may change during the minting process. If they do, the system will mint as many tokens as possible up to the selected amount.\nCurrent price per token: ${ethers.formatEther(priceInSelectedCurrency)} ${paymentMethod.toUpperCase()}`,
                validate: input => isNaN(Number(input)) ? 'Amount must be a number' : true
            });

            console.log(`Minting ${amount} NodeLicense tokens...`);

            try {

                // Mint the NodeLicense tokens
                let amountMinted = 0;
                const { mintedNftIds, totalPricePaid } = await coreBulkMintNodeLicenses(
                    Number(amount),
                    signer,
                    175,
                    paymentMethod,
                    ethers.MaxUint256,
                    promoCode,
                    (tokenId: bigint) => {
                        amountMinted++;
                        console.log(`Minted ID (${amountMinted}/${amount}): ${tokenId}`);
                    }
                );

                console.log('Tokens successfully minted.');
                
                // Convert pricePaid from wei to eth using ethers utils
                console.log(`Price Paid for Minting (in ${paymentMethod.toUpperCase()}): ${ethers.formatEther(totalPricePaid)}`);
                
            } catch (error) {
                console.error(`Error minting tokens: ${(error as Error).message}`);
            }
        });
}
