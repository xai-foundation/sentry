import { SentryWallet } from "@sentry/sentry-subgraph-client";

/**
 * Splits an array of sentry wallets into batches based on the maximum allowed redemptions per batch.
 *
 * @param {SentryWallet[]} sentryWallets - The array of sentry wallets to split into batches.
 * @param {number} maxIndicesPerBatch - The maximum number of redemptions allowed per batch.
 * @returns {SentryWallet[][]} An array of batches, where each batch is an array of sentry wallets.
 */
export function splitSentryWalletsIntoBatches(sentryWallets:SentryWallet[], maxIndicesPerBatch: number) {
    const sentryWalletBatches = [];  // This will store the final array of batches.

    let currentBatch:SentryWallet[] = [];           // Temporary storage for the current batch of sentry wallets.
    let currentBatchCount = 0;       // Counter to track the total number of redemptions in the current batch.

    // Iterate through each sentry wallet in the input array.
    for (let i = 0; i < sentryWallets.length; i++) {
        const sentryWallet = sentryWallets[i];  // Get the current sentry wallet.

        // Check if adding the current wallet's redemptions will exceed the max allowed indices per batch.
        if (currentBatchCount + sentryWallet.redemptions.length > maxIndicesPerBatch) {
            // If it exceeds, push the current batch to the batches array.
            sentryWalletBatches.push(currentBatch);
            // Reset for a new batch.
            currentBatch = [];
            currentBatchCount = 0;
        }

        // Add the current wallet to the new batch and update the redemption count.
        if (sentryWallet.redemptions.length > 0) {
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
