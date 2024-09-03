import hardhat from "hardhat";
import { config } from "@sentry/core";
const { ethers, upgrades } = hardhat;

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const referee = await ethers.getContractFactory("Referee8");
    console.log("Got factory");
    try {
        await upgrades.upgradeProxy(config.refereeAddress, referee, { call: { fn: "initialize", args: [] } });

    } catch (error) {
        console.error("Failed upgrade", error)
        return;

    } console.log("Upgraded");

    await run("verify:verify", {
        address: config.refereeAddress,
        constructorArguments: [],
    });
    console.log("verified")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});