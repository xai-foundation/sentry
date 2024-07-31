import fs from "fs";
import hardhat from "hardhat";
import { getAllSentryWallets } from "@sentry/core";

const { ethers } = hardhat;

const OUTPUT_PATH = "./assets/csv-output/stakes.csv";

async function main() {

    // Get all wallets from subgraph
    const wallets = await getAllSentryWallets();

    console.log("Total number of wallets: ", wallets.length);

    // Create CSV header row
    let csvContent = "Address,Key Count,Staked Key Count,Total esXai Staked\n";
    
    // Create CSV content
    for (const wallet of wallets) {
        // Calculate total esXai staked
        const totalEsXaiStaked = BigInt(wallet.v1EsXaiStakeAmount) + BigInt(wallet.esXaiStakeAmount);

        // Format total esXai staked from wei to esXai
        const formattedTotalEsXaiStaked = ethers.formatUnits(totalEsXaiStaked, 18);

        // Add wallet data to CSV content
        csvContent += `${wallet.address},${wallet.keyCount},${wallet.stakedKeyCount},${formattedTotalEsXaiStaked}\n`;
    }

    // Write CSV file
    fs.writeFileSync(OUTPUT_PATH, csvContent);

    console.log(`CSV file has been created at ${OUTPUT_PATH}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});