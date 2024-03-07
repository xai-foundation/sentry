import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;
import { safeVerify } from "../utils/safeVerify.mjs";

const address = "0xfD41041180571C5D371BEA3D9550E55653671198";

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    //DEPLOY POOL IMPL
    console.log("Deploying StakingPool implementation...");
    const StakingPool = await ethers.deployContract("StakingPool");
    await StakingPool.waitForDeployment();
    const poolImplAddress = await StakingPool.getAddress();

    // //DEPLOY BUCKET TRACKER IMPL
    console.log("Deploying BucketTracker implementation...");
    const BucketTracker = await ethers.deployContract("BucketTracker");
    await BucketTracker.waitForDeployment();
    const bucketImplAddress = await BucketTracker.getAddress();

    console.log("Deploying PoolFactory Upgradable...");
    const PoolFactory = await ethers.getContractFactory("PoolFactory");
    const poolFactory = await upgrades.deployProxy(PoolFactory, [deployerAddress, poolImplAddress, bucketImplAddress], { kind: "transparent", deployer });
    const tx = await poolFactory.deploymentTransaction();
    await tx.wait(3);
    const poolFactoryAddress = await poolFactory.getAddress();
    console.log("PoolFactory deployed to:", poolFactoryAddress);

    //Upgrade the referee
    const referee = await ethers.getContractFactory("Referee5");
    console.log("Got factory");
    await upgrades.upgradeProxy(address, referee, { call: { fn: "initialize", args: [poolFactoryAddress] } });
    console.log("Upgraded");

    await safeVerify({ contract: poolFactory });

    await run("verify:verify", {
        address: address,
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

    console.log("verified")
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});