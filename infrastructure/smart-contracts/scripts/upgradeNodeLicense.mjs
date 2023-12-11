import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
const address = "0xbc14d8563b248B79689ECbc43bBa53290e0b6b66";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const NodeLicense = await ethers.getContractFactory("NodeLicense3");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, NodeLicense);
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