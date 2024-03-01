import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;

const address = "0xfD41041180571C5D371BEA3D9550E55653671198";


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const referee = await ethers.getContractFactory("Referee3");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, referee, { call: { fn: "initialize", args: [] } });
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