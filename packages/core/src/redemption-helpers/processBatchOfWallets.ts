import { SentryWallet } from "@sentry/sentry-subgraph-client";
import { ethers } from "ethers";
import { config } from "../index.js";
import { esXaiAbi } from "../abis/index.js";

/**
 * Processes a batch of wallets by calling the contract method to convert redemptions.
 *
 * @param {SentryWallet[]} batchToProcess - An array of sentry wallet objects to process.
 * @param {ethers.Signer} signer - The signer used to sign transactions and interact with the contract.
 * @returns {Promise<void>} A promise that resolves when the batch has been processed or after the maximum retries are reached.
 */
export async function processBatchOfWallets(batchToProcess:SentryWallet[], signer:ethers.Signer): Promise<void> {
    // Initialize the contract with the provided signer
    const esXaiContract = new ethers.Contract(config.esXaiAddress, esXaiAbi, signer);

    // Extract addresses and indices from the batch of wallets
    const { addresses, indices } = extractAddressesAndIndices(batchToProcess);

    const MAX_RETRIES = 2;
    let retries = 0;

    // Retry the contract call up to MAX_RETRIES times
    while (retries < MAX_RETRIES) {    
        try {
            // Call the contract method to process redemptions
            await esXaiContract.convertRedemptionsInProcess(addresses, indices);
        } catch (error) {
            // Log any errors that occur during the contract call
            console.error(`Error processing batch of wallets on attempt ${retries + 1} starting with address ${addresses[0]}: `, error);
            retries++;
            if (retries === MAX_RETRIES) {
                console.error("Max retries reached. Skipping this batch.");
                console.error("Failed addresses: ", addresses);
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));  // Exponential backoff
        }
    }
}


/**
 * Extracts wallet addresses and redemption indices from a batch of wallets.
 *
 * @param {SentryWallet[]} batchToProcess - An array of sentry wallet objects to process.
 * @returns {{addresses: string[], indices: number[][]}} An object containing an array of wallet addresses and an array of arrays of redemption indices for each wallet.
 */
function extractAddressesAndIndices(batchToProcess:SentryWallet[]) {
    const addresses: string[] = [];  // Array to hold wallet addresses
    const indices: number[][] = [];    // Array to hold arrays of redemption indices for each wallet
    
    // Iterate through each wallet in the batch
    for (let i = 0; i < batchToProcess.length; i++) {
        const wallet = batchToProcess[i]; // Get the current wallet
        
        // Add the wallet's address to the addresses array
        addresses.push(wallet.address);
        
        // Initialize an empty array for the current wallet's redemption indices
        indices[i] = [];
        
        // Iterate through each redemption for the current wallet
        for (let j = 0; j < wallet.redemptions.length; j++) {
            // Add the redemption index to the indices array for this wallet
            indices[i].push(wallet.redemptions[j].index);
        }
    }
    
    // Return an object containing the extracted addresses and indices
    return { addresses, indices };
}
