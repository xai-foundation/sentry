import hardhat from "hardhat";
import { getUpgradeAndCallData } from "./utils/getUpgradeTransactionData.mjs";
const { ethers, upgrades } = hardhat;

const PROXY_TO_UPGRADE_ADDRESS = "0x415777DeB21bde51369F2218db4618e61419D4Dc";
const NEW_IMPLEMENTATION_NAME = "XaiVoting2";

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    console.log(`Deploy implementation ${NEW_IMPLEMENTATION_NAME}...`);
    

    const contractInstance = await ethers.getContractFactory(NEW_IMPLEMENTATION_NAME);
    // await upgrades.forceImport(PROXY_TO_UPGRADE_ADDRESS, contractInstance);
    const implementationAddress = await upgrades.prepareUpgrade(PROXY_TO_UPGRADE_ADDRESS, contractInstance, { kind: "transparent", redeployImplementation: "always" });

    console.log(`DEPLOYED IMPLEMENTATION ${NEW_IMPLEMENTATION_NAME}`);
    console.log(implementationAddress);

    const upgradeTXData = getUpgradeAndCallData(
        {
            upgradeCallFunctionName: "initialize",
            upgradeCallFunctionSignature: "function initialize()",
            upgradeCallFunctionParams: []
        }
    );

    console.log("MultiSig transaction builder arguments:");
    console.log(`Proxy: ${PROXY_TO_UPGRADE_ADDRESS}`);
    console.log(`Implementation: ${implementationAddress}`);
    console.log(`data: ${upgradeTXData}`);

    console.log("verifying implementation...");

    await run("verify:verify", {
        address: implementationAddress,
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