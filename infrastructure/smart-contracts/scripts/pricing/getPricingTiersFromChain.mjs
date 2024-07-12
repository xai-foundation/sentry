import fs from "fs";
import hardhat from "hardhat";
import { NodeLicenseAbi } from "@sentry/core";
const { ethers } = hardhat;

/**
 * Fetches data from the blockchain and writes it to a CSV file.
 * The function connects to a smart contract, retrieves pricing tier data,
 * and writes the data to a CSV file with headers "Qty" and "Price".
 *
 * @async
 * @function getMockDataAndWriteCSV
 * @returns {Promise<void>} - A promise that resolves when the CSV file has been written.
 */
async function getPricingTierDataAndWriteCSV() {
    // Initialize the smart contract instance
    const nodeLicense = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, ethers.provider);

    // Get the number of pricing tiers from the contract
    const numberOfTiers = await nodeLicense.getPricingTiersLength();
    console.log("Number of tiers:", numberOfTiers);

    // Create the CSV content with headers
    let csvContent = "Qty,Price\n";

    // Loop through each tier and retrieve the data
    for (let i = 0; i < numberOfTiers; i++) {
        const tierData = await nodeLicense.getPricingTier(i);
        const quantity = tierData.quantity;
        const price = tierData.price;
        csvContent += `${quantity},${price}\n`;
    }

    // Write the CSV content to a file
    await fs.writeFile("./assets/csv-output/pricing-tiers.csv", csvContent, {}, (err) => {
        if (err) {
            console.error("Error writing to CSV file:", err);
            return;
        }
        console.log("CSV file has been saved.");
    });
}

// Execute the function and handle any errors
getPricingTierDataAndWriteCSV().then(() => {
    console.log("Done!");
}).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
