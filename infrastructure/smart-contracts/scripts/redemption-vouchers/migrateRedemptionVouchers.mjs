import { config, getBlockOfSentryWalletsFromSubgraph, splitSentryWalletsIntoBatches, processBatchOfWallets} from "@sentry/core";

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());

    console.log("Starting redemption migration...");
    const esXai = await ethers.getContractFactory("esXai3");
    const esXaiInstance = await new ethers.Contract(config.esXaiAddress, esXai.interface, deployer);

    let lastUserIndex = 0;

    // Determine How Many Redemptions Can be Processed in a Single Transaction
    const USER_BLOCK_SIZE = 5000;
    const REDEMPTIONS_PER_TX = 100;

    while(true) {

        // Retrieve a large block of users from the subgraph
        const sentryWallets = await getBlockOfSentryWalletsFromSubgraph(USER_BLOCK_SIZE, lastUserIndex);

        // If there are no users left, break the loop
        if(sentryWallets.length === 0) {
            break;
        }
        
        const walletBatches = splitSentryWalletsIntoBatches(sentryWallets, REDEMPTIONS_PER_TX);

        for (let i = 0; i < walletBatches.length; i++) {
            const walletBatch = walletBatches[i];
            console.log(`Processing batch ${i + 1} of ${walletBatches.length}`);
            await processBatchOfWallets(walletBatch, esXaiInstance);
        }

        // Update the last user index to fetch the next block of users
        lastUserIndex += USER_BLOCK_SIZE;

        console.log(`Processed ${lastUserIndex} users...`);
    }

    console.log("Redemption migration complete.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});