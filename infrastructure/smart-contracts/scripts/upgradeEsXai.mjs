import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
//TODO Add current proxy contract address to update
const address = "0x2fef24A57705A652A09Dd8aD8c6c7BC99c017c04";
const foundationReceiver = "0x490A5C858458567Bd58774C123250de11271f165"
const foundationBasePoints = BigInt(500);


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const esXai2 = await ethers.getContractFactory("esXai2");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, esXai2, { call: { fn: "initialize", args: [foundationReceiver, foundationBasePoints] } });
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