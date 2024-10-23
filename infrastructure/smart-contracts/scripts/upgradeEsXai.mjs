import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { config } from "@sentry/core";
//TODO Add current proxy contract address to update
const address = config.esXaiAddress;

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    console.log("esXai address: ", address);

    // Upgrade for TBR release, 
    console.log("Upgrade to esXai2...")
    const esXai3 = await ethers.getContractFactory("esXai2");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, esXai3);

    // // This is the upgrade for post TBR, remove the block above once upgraded.
    // console.log("Upgrade to esXai3...")
    // const esXai3 = await ethers.getContractFactory("esXai3");
    // console.log("Got factory");
    // await upgrades.upgradeProxy(address, esXai3,
    //     {
    //         call: {
    //             fn: "initialize",
    //             args: [
    //                 config.refereeAddress,
    //                 config.nodeLicenseAddress,
    //                 config.poolFactoryAddress,
    //                 BigInt(10) // TODO: get this value from management to set the max number of keys to trigger KYC required on redemption claim
    //             ]
    //         }
    //     }
    // );

    console.log("Upgraded esXai");

    await run("verify:verify", {
        address: address,
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