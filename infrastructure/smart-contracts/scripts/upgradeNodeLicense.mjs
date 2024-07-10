import hardhat, { config } from "hardhat";
const { ethers, upgrades } = hardhat;
const address = config.nodeLicenseAddress;
const xaiAddress = config.xaiAddress;
const esXaiAddress = config.esXaiAddress;
const ethChainLinkFeedAddress = config.ethChainLinkFeedAddress;
const xaiChainLinkFeedAddress = config.xaiChainLinkFeedAddress;


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const NodeLicense = await ethers.getContractFactory("NodeLicense7");
    console.log("Got factory");   
    await upgrades.upgradeProxy(address, NodeLicense,
         { call: { fn: "initialize",
             args: [
                xaiAddress, 
                esXaiAddress, 
                ethChainLinkFeedAddress, 
                xaiChainLinkFeedAddress
            ] } });
    console.log("Upgraded");

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