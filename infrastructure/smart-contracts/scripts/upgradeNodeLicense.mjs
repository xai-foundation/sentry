import { config } from "@sentry/core";
import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
const NODELICENSE_ADDRESS = config.nodeLicenseAddress;

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const NodeLicense = await ethers.getContractFactory("NodeLicense9");
    console.log("Got factory");
    await upgrades.upgradeProxy(NODELICENSE_ADDRESS, NodeLicense, { call: { fn: "initialize", args: [] } });
    console.log("Upgraded");

    await run("verify:verify", {
        address: NODELICENSE_ADDRESS,
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