import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { config } from "@sentry/core";

/**
 * Main function to handle airdrop operations
 * @async
 * @function main
 * @description This function performs the following operations:
 * 1. Start the airdrop
 * 2. Process airdrop segments
 */
async function main() {
    const BLOCKS_TO_WAIT = 3; // Adjust this value as needed
    const segmentSize = 100; // Adjust this value as needed
    let airdropComplete = false;
    let totalSupplyAtStart = ethers.BigNumber.from(0);
    let airdropCounter = ethers.BigNumber.from(1);

    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    // Get the TinyKeysAirdrop contract instance
    const TinyKeysAirdrop = await ethers.getContractFactory("TinyKeysAirdrop");
    const tinyKeysAirdrop = await TinyKeysAirdrop.attach(config.tinyKeysAirdropAddress);

    /**
     * Start Airdrop
     * @description Calls the startAirdrop function on the TinyKeysAirdrop contract
     */
    const started = await tinyKeysAirdrop.airdropStarted();

    // Adding this this check in case the process is interrupted and needs to be restarted
    if (!started) {
        console.log("Starting Airdrop...");
        const startAirdropTx = await tinyKeysAirdrop.startAirdrop();
        await startAirdropTx.wait(BLOCKS_TO_WAIT);
        console.log("Airdrop started successfully");
    }

    totalSupplyAtStart = await tinyKeysAirdrop.totalSupplyAtStart();

    /**
     * Process Airdrop Segments
     * @description Processes airdrop segments until the airdrop is complete
     * @param {number} segmentSize - Number of node licenses to process in each segment
     */
    while (!airdropComplete) {
        console.log(`Processing tokens ${airdropCounter.toString()} to ${airdropCounter.add(segmentSize - 1).toString()} of ${totalSupplyAtStart.toString()}.`);
        try {
            const processTx = await tinyKeysAirdrop.processAirdropSegment(segmentSize);
            await processTx.wait(BLOCKS_TO_WAIT);
            console.log("Segment processed successfully");

            // Check if airdrop is complete
            airdropCounter = await tinyKeysAirdrop.airdropCounter();
                        
            if (airdropCounter.gte(totalSupplyAtStart)) {
                airdropComplete = true;
                console.log("Airdrop completed successfully");
            }
        } catch (error) {
            if (error.message.includes("Airdrop complete")) {
                airdropComplete = true;
                console.log("Airdrop completed successfully");
            } else {
                console.error("Error processing airdrop segment:", error);
                throw error;
            }
        }
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});