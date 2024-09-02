import hardhat from "hardhat";
import { esXaiAbi } from "@sentry/core";
const { ethers } = hardhat;

async function main() {
    
    const ESXAI_SEPOLIA_ADDRESS = "0x5776784c2012887d1f2fa17281e406643cba5330";
    const REDEMPTIONS_QTY = 100;
    const BLOCKS_TO_WAIT = 1;

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Please set your PRIVATE_KEY in a .env file");
    }
    // Set up a provider using ethers
    const provider = ethers.provider;  // Correctly initialize provider from ethers
  
    // Create a signer
    const signer = new ethers.Wallet(privateKey, provider);
    const signerAddress = await signer.getAddress();
    console.log("Signer address:", signerAddress);

    console.log("Starting Script");

    const esXai = new ethers.Contract(ESXAI_SEPOLIA_ADDRESS, esXaiAbi, signer);
    const startingRedemptionQty = await esXai.getRedemptionRequestCount(signerAddress);
    console.log("Starting redemption qty", startingRedemptionQty.toString());
    const redemptionAmount = ethers.parseEther("0.01");
    const duration = 10 * 60; // 10 minutes
    for (let i = 0; i < REDEMPTIONS_QTY; i++) {
        console.log("Creating redemption request", i);
        const redTx = await esXai.startRedemption(redemptionAmount, duration);
        await redTx.wait(BLOCKS_TO_WAIT);
        console.log("Redemption request created", i);
    }

    const endingRedemptionQty = await esXai.getRedemptionRequestCount(signerAddress);
    console.log("Ending redemption qty", endingRedemptionQty.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});