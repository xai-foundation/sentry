import { ethers } from 'ethers';
import { getProvider } from '../utils/getProvider.js';

/**
 * Sends the base currency of the chain to a recipient address.
 * @param privateKey - The private key of the sender's address.
 * @param amountInWei - The amount of base currency to send in wei.
 * @param recipientAddress - The recipient's address.
 * @returns The transaction hash.
 */
export async function transferBaseCurrency(
    privateKey: string,
    amountInWei: bigint,
    recipientAddress: string
): Promise<string> {

    // Create a new instance of ethers.Wallet with the private key
    const wallet = new ethers.Wallet(privateKey);

    // Get the provider
    const provider = getProvider();

    // Connect the wallet to the provider
    const connectedWallet = wallet.connect(provider);

    // Define the transaction
    const transaction = {
        to: recipientAddress,
        value: amountInWei
    };

    // Send the transaction
    const txResponse = await connectedWallet.sendTransaction(transaction);

    // Return the transaction hash
    return txResponse.hash;
}