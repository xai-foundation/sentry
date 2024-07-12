import fs from "fs";
import hardhat from "hardhat";
import { NodeLicenseAbi } from "@sentry/core";
const { ethers } = hardhat;

const nodeLicenseAddress = config.nodeLicenseAddress;
const nodeLicense = await new ethers.Contract(nodeLicenseAddress, NodeLicenseAbi, ethers.provider);

// Mock function to read blockchain and return two arrays of mock data
async function getTierData(tierIndex) {
        return [tierData.quantity, tierData.price];
    }


async function getMockDataAndWriteCSV() {
    const numberOfTiers = await nodeLicense.getPricingTiersLength();
    console.log("Number of tiers:", numberOfTiers);

    // Create the CSV content
    let csvContent = "Qty, Price\n";
    for (let i = 0; i < numberOfTiers; i++) {       
        const tierData = await nodeLicense.getPricingTier(i);
        const quantity = tierData.quantity;
        const price = tierData.price;
        csvContent += `${quantity},${price}\n`;
    }

    // Write the CSV to a file
    await fs.writeFile("./assets/csv-output/pricing-tiers.csv", csvContent, {}, (err) => {
        if (err) {
            console.error("Error writing to CSV file:", err);
            return;
        }
        console.log("CSV file has been saved.");
    });
}

getMockDataAndWriteCSV().then(() => {
    console.log("Done!");
}).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
