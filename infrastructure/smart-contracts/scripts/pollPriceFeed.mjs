import hardhat from "hardhat";
import { NodeLicenseAbi } from "@sentry/core";
const { ethers } = hardhat;

const promoCode = "";
const contractAddress = "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2"; // Node license 9
const priceFeedPair = "ETHUSD";
const quantity = 1;

async function fetchPrice(nodeLicense) {
  try {
    const price = await nodeLicense.getPriceInUSD(quantity, promoCode);
    console.log(`[${new Date().toISOString()}] Price for ${quantity} ${priceFeedPair}:`, price.toString());
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

async function main() {
  console.log(`Starting price feed poll for: ${priceFeedPair} on contract: ${contractAddress}`);

  const provider = new ethers.JsonRpcProvider(testnetConfig.arbitrumSepolia);
  const nodeLicense = new ethers.Contract(contractAddress, NodeLicenseAbi, provider);

  // Poll every 10 seconds
  setInterval(() => fetchPrice(nodeLicense), 10000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
