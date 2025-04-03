import hardhat from "hardhat";
import { config } from "@sentry/core";
const { ethers, upgrades } = hardhat;

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const referee = await ethers.getContractFactory("Referee11");
    console.log("Got factory");
    try {
        await upgrades.upgradeProxy(config.refereeAddress, referee, { redeployImplementation: "always", call: { fn: "initialize", args: [] } });
        console.log("Upgraded");

        await run("verify:verify", {
            address: config.refereeAddress,
            constructorArguments: [],
        });
        console.log("verified")

    } catch (error) {
        console.error("Failed upgrade", error)
        return;
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});