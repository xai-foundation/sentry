import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { safeVerify } from "../utils/safeVerify.mjs";
import { esXaiAbi, config } from "@sentry/core";

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    //DEPLOY POOL IMPL
    console.log("Deploying StakingPool implementation...");
    const StakingPool = await ethers.deployContract("StakingPool");
    await StakingPool.waitForDeployment();
    const poolImplAddress = await StakingPool.getAddress();
    console.log("Deployed Impl", poolImplAddress)

    // // //DEPLOY BUCKET TRACKER IMPL
    console.log("Deploying BucketTracker implementation...");
    const BucketTracker = await ethers.deployContract("BucketTracker");
    await BucketTracker.waitForDeployment();
    const bucketImplAddress = await BucketTracker.getAddress();
    console.log("Deployed Impl", bucketImplAddress)


    //ONLY NEEDED IN PROD DEPLOY FOR AUTO VERIFICATION FROM FACTORY CONTRACTS
    console.log("Deploying TransparentUpgradeableProxyImplementationPool...");
    const TransparentUpgradeableProxyImplementationPool = await ethers.deployContract("TransparentUpgradeableProxyImplementation", [poolImplAddress, deployerAddress, "0x"]);
    await TransparentUpgradeableProxyImplementationPool.waitForDeployment();
    const transparentUpgradeableProxyImplementationPool = await TransparentUpgradeableProxyImplementationPool.getAddress();
    console.log("Deployed TransparentUpgradeableProxyImplementationPool", transparentUpgradeableProxyImplementationPool);

    //ONLY NEEDED IN PROD DEPLOY FOR AUTO VERIFICATION FROM FACTORY CONTRACTS
    console.log("Deploying transparentUpgradeableProxyImplementationBucket...");
    const TransparentUpgradeableProxyImplementationBucket = await ethers.deployContract("TransparentUpgradeableProxyImplementation", [bucketImplAddress, deployerAddress, "0x"]);
    await TransparentUpgradeableProxyImplementationBucket.waitForDeployment();
    const transparentUpgradeableProxyImplementationBucket = await TransparentUpgradeableProxyImplementationBucket.getAddress();
    console.log("Deployed transparentUpgradeableProxyImplementationBucket", transparentUpgradeableProxyImplementationBucket);

    console.log("Deploying PoolFactory Upgradable...");
    const PoolFactory = await ethers.getContractFactory("PoolFactory");

    const poolFactory = await upgrades.deployProxy(
        PoolFactory,
        [config.refereeAddress, config.esXaiAddress, config.nodeLicenseAddress, deployerAddress, poolImplAddress, bucketImplAddress],
        { kind: "transparent", deployer }
    );

    const tx = await poolFactory.deploymentTransaction();
    await tx.wait(3);
    const poolFactoryAddress = await poolFactory.getAddress();
    console.log("PoolFactory deployed to:", poolFactoryAddress);

    //TODO DEPLOY PoolProxyDeployer upgradable with init
    //TODO DEPLOY PoolProxyDeployer upgradable with init
    //TODO DEPLOY PoolProxyDeployer upgradable with init
    //TODO DEPLOY PoolProxyDeployer upgradable with init

    // Give PoolFactory auth to whitelist new pools & buckets on esXai
    console.log("Adding esXai DEFAULT_ADMIN_ROLE to PoolFactory...");
    const esXai = await new ethers.Contract(config.esXaiAddress, esXaiAbi, deployer);
    const esXaiAdminRole = await esXai.DEFAULT_ADMIN_ROLE();
    await esXai.grantRole(esXaiAdminRole, poolFactoryAddress);
    console.log("Granted role");
    //Add PoolFactory to whitelist
    await esXai.addToWhitelist(poolFactoryAddress);
    console.log("Added PoolFactory to esXai whitelist");


    // Upgrade the referee
    const referee = await ethers.getContractFactory("Referee5");
    console.log("Got factory");
    await upgrades.upgradeProxy(config.refereeAddress, referee, { call: { fn: "initialize", args: [poolFactoryAddress] } });
    console.log("Upgraded");

    await run("verify:verify", {
        address: poolFactoryAddress,
        constructorArguments: [],
        contract: "PoolFactory"
    });

    await run("verify:verify", {
        address: config.refereeAddress,
        constructorArguments: [],
        contract: "Referee5"
    });

    await run("verify:verify", {
        address: bucketImplAddress,
        constructorArguments: [],
    });

    await run("verify:verify", {
        address: poolImplAddress,
        constructorArguments: [],
    });

    await run("verify:verify", {
        address: transparentUpgradeableProxyImplementationPool,
        constructorArguments: [poolImplAddress, deployerAddress, "0x"],
        contract: "contracts/staking-v2/TransparentUpgradable.sol:TransparentUpgradeableProxyImplementation"
    });

    await run("verify:verify", {
        address: transparentUpgradeableProxyImplementationBucket,
        constructorArguments: [bucketImplAddress, deployerAddress, "0x"],
        contract: "contracts/staking-v2/TransparentUpgradable.sol:TransparentUpgradeableProxyImplementation"
    });

    console.log("verified")
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});