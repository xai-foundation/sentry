import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
//TODO Add current proxy contract address to update
const address = "0x4C749d097832DE2FEcc989ce18fDc5f1BD76700c";
const maxKeys = BigInt(10); // TODO get this value from management to set the max number of keys


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const esXai3 = await ethers.getContractFactory("esXai3");
    console.log("Got factory");await upgrades.upgradeProxy(address, esXai3,
         { call: { fn: "initialize",
            args: [
                config.refereeAddress,
                config.nodeLicenseAddress, 
                maxKeys
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