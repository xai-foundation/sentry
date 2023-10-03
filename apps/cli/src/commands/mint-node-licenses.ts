import * as Vorpal from "vorpal";
import { ethers } from "ethers";
import { getSignerFromPrivateKey, mintNodeLicenses as coreMintNodeLicenses } from "@xai-vanguard-node/core";

export function mintNodeLicenses(cli: Vorpal) {
    cli
        .command('mint-node-licenses', 'Mints NodeLicense tokens if the signer has enough balance and the amount is less than the maximum mint amount.')
        .action(async function (this: Vorpal.CommandInstance) {
            const amountPrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'amount',
                message: 'Enter the amount of tokens to mint:',
            };
            const { amount } = await this.prompt(amountPrompt);

            const privateKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of the wallet:',
                mask: '*'
            };
            const { privateKey } = await this.prompt(privateKeyPrompt);

            this.log(`Minting ${amount} NodeLicense tokens...`);

            // get a signer of the private key
            const {signer} = getSignerFromPrivateKey(privateKey);

            try {
                const { mintedNftIds, txReceipt, pricePaid } = await coreMintNodeLicenses(
                    Number(amount),
                    signer,
                );

                this.log(`Tokens successfully minted. Here are the details:`);
                mintedNftIds.forEach((id, index) => {
                    this.log(`Minted ID: ${id}`);
                });
                
                

                // Convert pricePaid from wei to eth using ethers utils
                const pricePaidInEth = ethers.formatEther(pricePaid);
                this.log(`Price Paid for Minting (in ETH): ${pricePaidInEth}`);
                

            } catch (error) {
                this.log(`Error minting tokens: ${(error as Error).message}`);
            }
        });
}

