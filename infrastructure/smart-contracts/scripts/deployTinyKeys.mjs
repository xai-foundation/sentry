import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { esXaiAbi, config } from "@sentry/core";

/**
 * Main function to deploy and upgrade contracts
 * @async
 * @function main
 * @description This function deploys new contracts and upgrades existing ones in the following order:
 * 1. Upgrade esXai3
 * 2. Upgrade NodeLicense8
 * 3. Upgrade PoolFactory2
 * 4. Upgrade Referee9
 * 5. Add NodeLicense to esXai transfer whitelist
 * 6. Verify all deployed and upgraded contracts
 */
async function main() {
    const BLOCKS_TO_WAIT = 3;
    const maxKeysNonKyc = 1;//Maximum number of keys that a non-KYC user can own and still complete esXai redemptions

    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);


    const refereeCalculationsAddress = config.refereeCalculationsAddress;
    const tinyKeysAirdropAddress = config.tinyKeysAirdropAddress

    /**
     * Upgrade esXai3 Contract
     * @description Upgrades the existing esXai contract to esXai3
     * @param {string} refereeAddress - Address of the Referee contract
     * @param {string} nodeLicenseAddress - Address of the NodeLicense contract
     * @param {number} maxKeysNonKyc - Maximum number of keys that a non-KYC user can own
     */
    console.log("Upgrading esXai3...");
    const EsXai3 = await ethers.getContractFactory("esXai3");
    console.log("Got esXai factory");

    const esXaiUpgradeParams = [config.refereeAddress, config.nodeLicenseAddress, config.poolFactoryAddress, maxKeysNonKyc];
    const upgradeEsXaiTx = await upgrades.upgradeProxy(config.esXaiAddress, EsXai3, { call: {fn: "initialize", args: esXaiUpgradeParams } });
    await upgradeEsXaiTx.wait(BLOCKS_TO_WAIT);
    console.log("Upgraded esXai3");
    
    /**
     * Upgrade NodeLicense Contract
     * @description Upgrades the existing NodeLicense contract to NodeLicense8
     * @param {string} xaiAddress - Address of the XAI token contract
     * @param {string} esXaiAddress - Address of the esXai contract
     * @param {string} chainlinkEthUsdPriceFeed - Address of the Chainlink ETH/USD price feed
     * @param {string} chainlinkXaiUsdPriceFeed - Address of the Chainlink XAI/USD price feed
     * @param {string} tinyKeysAirdropAddress - Address of the TinyKeysAirdrop contract
     */
    console.log("Upgrading NodeLicense...");
    const NodeLicense8 = await ethers.getContractFactory("NodeLicense8");    
    console.log("Got NodeLicense factory");

    const nodeLicenseUpgradeParams = [config.xaiAddress, config.esXaiAddress, config.chainlinkEthUsdPriceFeed, config.chainlinkXaiUsdPriceFeed, tinyKeysAirdropAddress];
    const upgradeNodeLicenseTx = await upgrades.upgradeProxy(config.nodeLicenseAddress, NodeLicense8, { call: {fn: "initialize", args: nodeLicenseUpgradeParams } });
    await upgradeNodeLicenseTx.wait(BLOCKS_TO_WAIT);

    /**
     * Upgrade PoolFactory Contract
     * @description Upgrades the existing PoolFactory contract to PoolFactory2
     * @param {string} tinyKeysAirdropAddress - Address of the TinyKeysAirdrop contract
     */
    console.log("Upgrading PoolFactory...");
    const PoolFactory2 = await ethers.getContractFactory("PoolFactory2");
    console.log("Got PoolFactory factory");
    
    const poolFactoryUpgradeParams = [tinyKeysAirdropAddress];
    const poolFactoryUpgradeTx = await upgrades.upgradeProxy(config.poolFactoryAddress, PoolFactory2, { call: {fn: "initialize", args: poolFactoryUpgradeParams } });
    await poolFactoryUpgradeTx.wait(BLOCKS_TO_WAIT);    

    /**
     * Upgrade Referee Contract
     * @description Upgrades the existing Referee contract to Referee9
     * @param {string} refereeCalculationsAddress - Address of the RefereeCalculations contract
     */
    console.log("Upgrading Referee...");
    const Referee9 = await ethers.getContractFactory("Referee9");
    console.log("Got Referee factory");

    const refereeUpgradeParams = [refereeCalculationsAddress];
    const refereeUpgradeTx = await upgrades.upgradeProxy(config.refereeAddress, Referee9, { call: {fn: "initialize", args: refereeUpgradeParams } });
    await refereeUpgradeTx.wait(BLOCKS_TO_WAIT);

    /**
     * Add NodeLicense to esXai transfer whitelist
     * @description Grants the required role and adds NodeLicense to the esXai transfer whitelist
     * @param {Contract} esXai - Instance of the esXai contract
     */
    console.log("Adding NodeLicense to esXai transfer whitelist...");
    const esXai = await new ethers.Contract(config.esXaiAddress, esXaiAbi, deployer);
    const whiteListTx = await esXai.addToWhitelist(config.nodeLicenseAddress);
    console.log("Successfully Added NodeLicense to esXai transfer whitelist");
    await whiteListTx.wait(BLOCKS_TO_WAIT);

    const deployedContracts = {
        refereeCalculations: refereeCalculationsAddress,
        tinyKeysAirdrop: tinyKeysAirdropAddress,
    }

    console.log("Deployed contracts: ");
    console.log(deployedContracts);

    /**
     * Verify Contracts
     * @description Verifies all deployed and upgraded contracts on the blockchain explorer
     */
    console.log("Starting verification... ");

    await run("verify:verify", {
        address: config.esXaiAddress,
        constructorArguments: [],
        contract: "esXai3"
    });
    await new Promise((resolve)=> setTimeout(resolve, 1000));
    
    await run("verify:verify", {
        address: config.nodeLicenseAddress,
        constructorArguments: [],
        contract: "NodeLicense8"
    });
    await new Promise((resolve)=> setTimeout(resolve, 1000));

    await run("verify:verify", {
        address: config.poolFactoryAddress,
        constructorArguments: [],
        contract: "PoolFactory2"
    });
    await new Promise((resolve)=> setTimeout(resolve, 1000));

    await run("verify:verify", {
        address: config.refereeAddress,
        constructorArguments: [],
        contract: "Referee9"
    });

    console.log("Verification complete ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});