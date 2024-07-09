import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { safeVerify } from "../utils/safeVerify.mjs";
import { esXaiAbi, config } from "@sentry/core";

async function main() {

    const airDropMultiplier = 99; // Number of new NodeLicense received per 1 NodeLicense currently owned;

    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    // Start Airdrop

    // Process Airdrop




}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});