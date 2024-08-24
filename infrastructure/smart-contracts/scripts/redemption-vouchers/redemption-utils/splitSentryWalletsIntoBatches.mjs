/**
 * Splits an array of sentry wallets into batches based on a maximum number of redemption indices per batch.
 *
 * @param {Array} sentryWallets - The array of sentry wallet objects to be split into batches.
 * @param {number} maxIndicesPerBatch - The maximum number of redemption indices allowed in each batch.
 * @returns {Array<Array>} - An array of batches, each containing a sub-array of sentry wallet objects.
 */
export async function splitSentryWalletsIntoBatches(sentryWallets, maxIndicesPerBatch) {
    const sentryWalletBatches = [];  // This will store the final array of batches.

    let currentBatch = [];           // Temporary storage for the current batch of sentry wallets.
    let currentBatchCount = 0;       // Counter to track the total number of redemptions in the current batch.

    // Iterate through each sentry wallet in the input array.
    for (let i = 0; i < sentryWallets.length; i++) {
        const sentryWallet = sentryWallets[i];  // Get the current sentry wallet.

        // Check if adding the current wallet's redemptions will exceed the max allowed indices per batch.
        if (currentBatchCount + sentryWallet.redemptions.length > maxIndicesPerBatch) {
            // If it exceeds, push the current batch to the batches array and reset for a new batch.
            sentryWalletBatches.push(currentBatch);
            currentBatch = [];
            currentBatchCount = 0;
        } else {
            // If it does not exceed, add the current wallet to the batch and update the redemption count.
            currentBatch.push(sentryWallet);
            currentBatchCount += sentryWallet.redemptions.length;
        }
    }

    // After the loop, if there are any wallets left in the current batch, add it to the batches.
    if (currentBatch.length > 0) {
        sentryWalletBatches.push(currentBatch);
    }

    return sentryWalletBatches;  // Return the array of batches.
}
