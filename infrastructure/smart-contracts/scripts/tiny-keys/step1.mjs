import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { config } from "@sentry/core";
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

    const NODE_LICENSE_ADDRESS = "0x3d9b0902720d3e90b829e313E945b51e77848271";
    const REFEREE_ADDRESS = "0xC1e0E1a0AEC648a484d7c1e318B32F610553BEC3";
    const POOL_FACTORY_ADDRESS = "0xdA02078f31cB13420684821756a6a6A2F2491e6d";
    const ESXAI_ADDRESS = "0x3b90b0410687B726fAD8DA02114184adB368fC4A";
    const XAI_ADDRESS = "0x81753DFD1Db942F2E7b32BE6353f23f80eD09a87";
    const ETH_PRICE_FEED_ADDRESS = "0x37068923AD25F33d07A5283ceBD094D581bAeFda";
    const XAI_PRICE_FEED_ADDRESS = "0x5cB2FDEc5B65221b0e5E55384422D6E02A435f6a";
    const USDC_ADDRESS = "0x14196F08a4Fa0B66B7331bC40dd6bCd8A1dEeA9F";
    const REF_CALC_ADDRESS = "0x26Be32B925F4B55740840ed6511757A27C72F363";
    const KEY_MULTIPLIER = 99;

    // get the deployer
    const signers = (await ethers.getSigners());
    const deployer = signers[0];
    console.log("Deploying contracts with the account:", deployer.address);

    /**
     * Upgrade Referee Contract
     * @description Upgrades the existing Referee contract to Referee9
     * @param {string} refereeCalculationsAddress - Address of the RefereeCalculations contract
     */
    console.log("Upgrading Referee...");
    const Referee9 = await ethers.getContractFactory("Referee9", deployer);
    console.log("Got Referee factory");
    const referee9 = await upgrades.upgradeProxy(REFEREE_ADDRESS, Referee9);

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

    const esXaiUpgradeParams = [REFEREE_ADDRESS, NODE_LICENSE_ADDRESS, POOL_FACTORY_ADDRESS, maxKeysNonKyc];
    const esXai3 = await upgrades.upgradeProxy(ESXAI_ADDRESS, EsXai3, { call: { fn: "initialize", args: esXaiUpgradeParams } });
    console.log("Upgraded esXai3");

    // deploy tiny keys airdrop contract
    console.log("Deploying Tiny Keys Airdrop...");
    const TinyKeysAirdrop = await ethers.getContractFactory("TinyKeysAirdrop");
    const tinyKeysAirdrop = await upgrades.deployProxy(TinyKeysAirdrop, [NODE_LICENSE_ADDRESS, REFEREE_ADDRESS, POOL_FACTORY_ADDRESS, KEY_MULTIPLIER], { kind: "transparent", deployer });
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

    const nodeLicenseUpgradeParams = [
        XAI_ADDRESS,
        ESXAI_ADDRESS,
        ETH_PRICE_FEED_ADDRESS,
        XAI_PRICE_FEED_ADDRESS,
        tinyKeysAirdropAddress,
        USDC_ADDRESS,
        REF_CALC_ADDRESS,
        REFEREE_ADDRESS
    ];
    const nodeLicense8 = await upgrades.upgradeProxy(NODE_LICENSE_ADDRESS, NodeLicense8, { call: { fn: "initialize", args: nodeLicenseUpgradeParams } });

    // Comment out since this is happening already in the initialize of NodeLicense8
    // console.log("Grant AIRDROP_ADMIN_ROLE on NodeLicense to TK Airdrop contract ")
    // await nodeLicense8.grantRole(await nodeLicense8.AIRDROP_ADMIN_ROLE(), tinyKeysAirdropAddress)

    /**
     * Upgrade PoolFactory Contract
     * @description Upgrades the existing PoolFactory contract to PoolFactory2
     * @param {string} tinyKeysAirdropAddress - Address of the TinyKeysAirdrop contract
     */
    console.log("Upgrading PoolFactory...");
    const PoolFactory2 = await ethers.getContractFactory("PoolFactory2");
    console.log("Got PoolFactory factory");

    const poolFactoryUpgradeParams = [tinyKeysAirdropAddress];
    const poolFactory2 = await upgrades.upgradeProxy(POOL_FACTORY_ADDRESS, PoolFactory2, { call: { fn: "initialize", args: poolFactoryUpgradeParams } });

    const tinyKeysAirdropAdminRole = await tinyKeysAirdrop.DEFAULT_ADMIN_ROLE();
    for (let i = 1; i < 10; i++) {
        const adminWalletAddress = signers[i].address;
        console.log(`Granted admin role on TK Airdrop for wallet at index ${i}: ${adminWalletAddress}`);
        await tinyKeysAirdrop.grantRole(tinyKeysAirdropAdminRole, adminWalletAddress);
    }

    await tinyKeysAirdrop.startAirdrop();
    console.log("Started Airdrop, minting and staking is now disabled");

    /**
     * Add NodeLicense to esXai transfer whitelist
     * @description Grants the required role and adds NodeLicense to the esXai transfer whitelist
     * @param {Contract} esXai3 - Instance of the esXai contract
     */
    console.log("Adding NodeLicense to esXai transfer whitelist...");
    await esXai3.addToWhitelist(NODE_LICENSE_ADDRESS);
    console.log("Successfully Added NodeLicense to esXai transfer whitelist");

    console.log("Deployment complete.");

    /**
     * Verify Contracts
     * @description Verifies all deployed and upgraded contracts on the blockchain explorer
     */
    console.log("Starting verification... ");


    // verify contract
    await safeVerify({ skipWaitForDeployTx: true, contract: esXai3 });
    await safeVerify({ skipWaitForDeployTx: true, contract: tinyKeysAirdrop });
    await safeVerify({ skipWaitForDeployTx: true, contract: nodeLicense8 });
    await safeVerify({ skipWaitForDeployTx: true, contract: poolFactory2 });
    await safeVerify({ skipWaitForDeployTx: true, contract: referee9 });

    console.log("Verification complete ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});