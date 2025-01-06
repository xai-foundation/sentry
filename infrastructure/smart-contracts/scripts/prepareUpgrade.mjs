import hardhat from "hardhat";
import { getUpgradeAndCallData } from "./utils/getUpgradeTransactionData.mjs";
const { ethers, upgrades } = hardhat;

const PROXY_TO_UPGRADE_ADDRESS = "0xProxyAddressToUpgrade";
const NEW_IMPLEMENTATION_NAME = "ContractName";

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    console.log(`Deploy implementation ${NEW_IMPLEMENTATION_NAME}...`);
    
    const contractInstance = await ethers.getContractFactory(NEW_IMPLEMENTATION_NAME);
    const implementationAddress = await upgrades.prepareUpgrade(PROXY_TO_UPGRADE_ADDRESS, contractInstance);

    console.log(`DEPLOYED IMPLEMENTATION ${NEW_IMPLEMENTATION_NAME}`);
    console.log(implementationAddress);

    const upgradeTXData = getUpgradeAndCallData(
        {
            upgradeCallFunctionName: "initialize",
            upgradeCallFunctionSignature: "function initialize(address _esXaiBurnFoundationRecipient, uint256 _esXaiBurnFoundationBasePoints)",
            upgradeCallFunctionParams: ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831", 100n]
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