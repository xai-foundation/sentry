import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
//TODO Add current proxy contract address to update
const address = "0x4C749d097832DE2FEcc989ce18fDc5f1BD76700c";
const foundationReceiver = "0x1F941F7Fb552215af81e6bE87F59578C18783483"; // TODO double check this address
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