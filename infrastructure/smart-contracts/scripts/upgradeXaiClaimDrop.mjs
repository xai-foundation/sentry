import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
const address = "0x149107dEB70b9514930d8e454Fc32E77C5ABafE0";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const XaiGaslessClaim = await ethers.getContractFactory("XaiGaslessClaim");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, XaiGaslessClaim);
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