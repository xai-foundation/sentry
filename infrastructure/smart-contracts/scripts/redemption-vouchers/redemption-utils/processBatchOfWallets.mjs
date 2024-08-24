/**
 * Processes a batch of wallets by extracting their addresses and redemption indices
 * and calling the contract method to convert redemptions in process.
 *
 * @async
 * @function processBatchOfWallets
 * @param {Object[]} batchToProcess - Array of Sentry wallet objects to be processed.
 * @param {Object} esXaiContract - The contract instance used to convert redemptions.
 * @returns {Promise<void>} - A promise that resolves when the batch processing is complete.
 */
export async function processBatchOfWallets(batchToProcess, esXaiContract) {
    
    // Extract addresses and indices from the batch of wallets
    const { addresses, indices } = extractAddressesAndIndices(batchToProcess);

    const MAX_RETRIES = 3;
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
 * @function extractAddressesAndIndices
 * @param {Object[]} batchToProcess - Array of Sentry wallet objects to extract data from.
 * @param {string} batchToProcess[].address - The address of the wallet.
 * @param {Object[]} batchToProcess[].redemptions - Array of redemption objects for the wallet.
 * @param {number} batchToProcess[].redemptions[].index - The index of the redemption.
 * @returns {Object} - An object containing arrays of addresses and indices.
 */
function extractAddressesAndIndices(batchToProcess) {
    const addresses = [];  // Array to hold wallet addresses
    const indices = [];    // Array to hold arrays of redemption indices for each wallet
    
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
