import hardhat from "hardhat";
import { PoolFactoryAbi, config } from "@sentry/core";
const { ethers } = hardhat;

async function main() {
    const [deployer] = (await ethers.getSigners());

    // Give PoolFactory auth to whitelist new pools & buckets on esXai
    console.log("Enable staking on PoolFactory...");
    const poolFactory = await new ethers.Contract(config.poolFactoryAddress, PoolFactoryAbi, deployer);
    await poolFactory.enableStaking();
    console.log("Enabled staking on the pool factory");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});