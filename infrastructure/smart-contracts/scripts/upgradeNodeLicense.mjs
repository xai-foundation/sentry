import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
const address = "0xbc14d8563b248B79689ECbc43bBa53290e0b6b66";
const xaiAddress = "0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66";
const esXaiAddress = "0x4C749d097832DE2FEcc989ce18fDc5f1BD76700c";
const ethChainLinkFeedAddress = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612";
const xaiChainLinkFeedAddress = "0x806c532D543352e7C344ba6C7F3F00Bfbd309Af1";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const NodeLicense = await ethers.getContractFactory("NodeLicense8");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, NodeLicense, { call: { fn: "initialize", args: [xaiAddress, esXaiAddress, ethChainLinkFeedAddress, xaiChainLinkFeedAddress] } });
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