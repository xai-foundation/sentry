import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { esXaiAbi, config } from "@sentry/core";
import { safeVerify } from "../../utils/safeVerify.mjs";

/**
 * Main function to deploy and upgrade contracts
 * @async
 * @function main
 * @description This function deploys new contracts and upgrades existing ones in the following order:
 * 1. Upgrade esXai3
 * 2. Deploy Tiny Keys Airdrop Contract
 * 3. Upgrade NodeLicense8
 * 4. Upgrade PoolFactory2
 * 5. Upgrade Referee10
 * 6. Add NodeLicense to esXai transfer whitelist
 * 7. Verify all deployed and upgraded contracts
 */
async function main() {
    const maxKeysNonKyc = 1; //Maximum number of keys that a non-KYC user can own and still complete esXai redemptions

    const NODE_LICENSE_CONTRACT = config.nodeLicenseAddress;
    const REFEREE_CONTRACT = config.refereeAddress;
    const POOL_FACTORY_CONTRACT = config.poolFactoryAddress;
    const KEY_MULTIPLIER = 99;

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    console.log("Deploying contracts with the account:", deployer.address);

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
    const esXai3 = await upgrades.upgradeProxy(config.esXaiAddress, EsXai3, { call: {fn: "initialize", args: esXaiUpgradeParams } });
    console.log("Upgraded esXai3");

    // deploy tiny keys airdrop contract
    console.log("Deploying Tiny Keys Airdrop...");
    const TinyKeysAirdrop = await ethers.getContractFactory("TinyKeysAirdrop");
    const tinyKeysAirdrop = await upgrades.deployProxy(TinyKeysAirdrop, [NODE_LICENSE_CONTRACT, REFEREE_CONTRACT, POOL_FACTORY_CONTRACT, KEY_MULTIPLIER], { kind: "transparent", deployer });
    await tinyKeysAirdrop.deploymentTransaction();
    const tinyKeysAirdropAddress = await tinyKeysAirdrop.getAddress();
    console.log("Tiny Keys Airdrop deployed to:", tinyKeysAirdropAddress);   
    
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
    const nodeLicense8 = await upgrades.upgradeProxy(config.nodeLicenseAddress, NodeLicense8, { call: {fn: "initialize", args: nodeLicenseUpgradeParams } });

    /**
     * Upgrade PoolFactory Contract
     * @description Upgrades the existing PoolFactory contract to PoolFactory2
     * @param {string} tinyKeysAirdropAddress - Address of the TinyKeysAirdrop contract
     */
    console.log("Upgrading PoolFactory...");
    const PoolFactory2 = await ethers.getContractFactory("PoolFactory2");
    console.log("Got PoolFactory factory");
    
    const poolFactoryUpgradeParams = [tinyKeysAirdropAddress];
    const poolFactory2 = await upgrades.upgradeProxy(config.poolFactoryAddress, PoolFactory2, { call: {fn: "initialize", args: poolFactoryUpgradeParams } });

    /**
     * Upgrade Referee Contract
     * @description Upgrades the existing Referee contract to Referee9
     * @param {string} refereeCalculationsAddress - Address of the RefereeCalculations contract
     */
    console.log("Upgrading Referee...");
    const Referee10 = await ethers.getContractFactory("Referee10", deployer);
    console.log("Got Referee factory");

    const refereeUpgradeParams = [];
    const referee10 = await upgrades.upgradeProxy(config.refereeAddress, Referee10, { call: {fn: "initialize", args: refereeUpgradeParams } });

    /**
     * Add NodeLicense to esXai transfer whitelist
     * @description Grants the required role and adds NodeLicense to the esXai transfer whitelist
     * @param {Contract} esXai - Instance of the esXai contract
     */
    console.log("Adding NodeLicense to esXai transfer whitelist...");
    const esXai = await new ethers.Contract(config.esXaiAddress, esXaiAbi, deployer);
    await esXai.addToWhitelist(config.nodeLicenseAddress);
    console.log("Successfully Added NodeLicense to esXai transfer whitelist");

    console.log("Deployment complete.");

    /**
     * Verify Contracts
     * @description Verifies all deployed and upgraded contracts on the blockchain explorer
     */
    console.log("Starting verification... ");

    
	// verify contract
    await safeVerify({ contract: esXai3 });    
    await safeVerify({ contract: tinyKeysAirdrop });
    await safeVerify({ contract: nodeLicense8 });
    await safeVerify({ contract: poolFactory2 });
    await safeVerify({ contract: referee10 });

    console.log("Verification complete ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});