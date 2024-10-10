import hardhat from "hardhat";
const { ethers } = hardhat;
import { safeVerify } from "../utils/safeVerify.mjs";

/**
 * Main function to deploy contract
 * @async
 * @function main
 * @description This function deploys a Mock Rollup contract for testing purposes
 */
async function main() {
    const BLOCKS_TO_WAIT = 3;

    const [deployer] = (await ethers.getSigners());
    const deployerAddress = deployer.address;
    console.log("Deployer address", deployerAddress);

    console.log("Deploying Mock Rollup...");
    const MockRollup = await ethers.getContractFactory("MockRollup");
    console.log("Got MockRollup factory");

    const mockRollup = await MockRollup.deploy();
    const txMockRollup = await mockRollup.deploymentTransaction();

    await txMockRollup.wait(BLOCKS_TO_WAIT);

    const mockRollupAddress = await mockRollup.getAddress();
    console.log("Mock Rollup deployed to:", mockRollupAddress);

    /**
     * Verify Contracts
     * @description Verifies all deployed and upgraded contracts on the blockchain explorer
     */
    console.log("Starting verification... ");
    
    await safeVerify({ contract: mockRollup }),

    console.log("Verification complete ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});