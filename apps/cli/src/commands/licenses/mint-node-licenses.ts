import { Command } from 'commander';
import inquirer from 'inquirer';
import { ethers } from "ethers";
import { getSignerFromPrivateKey, mintNodeLicenses as coreMintNodeLicenses } from "@sentry/core";

/**
 * Function to mint NodeLicense tokens if the signer has enough balance and the amount is less than the maximum mint amount.
 * @param cli - Commander instance
 */
export function mintNodeLicenses(cli: Command): void {
    cli
        .command('mint-node-licenses')
        .description('Mints NodeLicense tokens if the signer has enough balance and the amount is less than the maximum mint amount.')
        .action(async () => {
            // Prompt user for the amount of tokens to mint
            const { amount } = await inquirer.prompt({
                type: 'input',
                name: 'amount',
                message: 'Enter the amount of tokens to mint:',
                validate: input => isNaN(Number(input)) ? 'Amount must be a number' : true
            });

            // Prompt user for the private key of the wallet
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of the wallet:',
                mask: '*'
            });

            // Prompt user for the promo code (optional)
            const { promoCode } = await inquirer.prompt({
                type: 'input',
                name: 'promoCode',
                message: 'Enter the promo code (optional):',
                default: '',
            });

            console.log(`Minting ${amount} NodeLicense tokens...`);

            try {
                // Get a signer using the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Mint the NodeLicense tokens
                const { mintedNftIds, pricePaid } = await coreMintNodeLicenses(
                    Number(amount),
                    signer,
                    promoCode
                );

                console.log('Tokens successfully minted. Here are the details:');
                mintedNftIds.forEach((id) => {
                    console.log(`Minted ID: ${id}`);
                });
                
                // Convert pricePaid from wei to eth using ethers utils
                const pricePaidInEth = ethers.formatEther(pricePaid);
                console.log(`Price Paid for Minting (in ETH): ${pricePaidInEth}`);
                
            } catch (error) {
                console.error(`Error minting tokens: ${(error as Error).message}`);
            }
        });
}
