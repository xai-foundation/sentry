import fs from "fs";
import hardhat from "hardhat";
import { NodeLicenseAbi, config } from "@sentry/core";
const { ethers } = hardhat;

/**
 * Fetches data from the blockchain and writes it to a JSON file.
 * The function connects to a smart contract, retrieves pricing tier data,
 * and writes the data to a JSON file with an array of objects containing "price" and "quantity".
 *
 * @async
 * @function getPricingTierDataAndWriteJSON
 * @returns {Promise<void>} - A promise that resolves when the JSON file has been written.
 */
async function getPricingTierDataAndWriteJSON() {
    // Initialize the smart contract instance   
    const nodeLicenseAddress = "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2";
  //  const nodeLicenseAddress = config.nodeLicenseAddress;
    const nodeLicense = new ethers.Contract(nodeLicenseAddress, NodeLicenseAbi, ethers.provider);

    // Get the number of pricing tiers from the contract
    const numberOfTiers = await nodeLicense.getPricingTiersLength();
    console.log("Number of tiers:", numberOfTiers);

    // Create an array to hold the JSON data
    const pricingData = [];

    // Loop through each tier and retrieve the data
    for (let i = 0; i < numberOfTiers; i++) {
        const tierData = await nodeLicense.getPricingTier(i);
        const quantity = tierData.quantity.toString();
        const price = tierData.price.toString();
        pricingData.push({ price, quantity });
    }

    // Write the JSON data to a file
    await fs.writeFile("./assets/json-output/tiers.json", JSON.stringify(pricingData, null, 2), {}, (err) => {
        if (err) {
            console.error("Error writing to JSON file:", err);
            return;
        }
        console.log("JSON file has been saved.");
    });
}

// Execute the function and handle any errors
getPricingTierDataAndWriteJSON().then(() => {
    console.log("Done!");
}).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
