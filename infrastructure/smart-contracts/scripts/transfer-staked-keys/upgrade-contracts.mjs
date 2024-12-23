import { config } from "@sentry/core";
import { safeVerify } from "../../utils/safeVerify.mjs";

import { PoolBeaconAbi } from "@sentry/core";

// Find this in the deployed PoolProxyDeployer's public fields. This should reflect which set of proxies you want to change; staking pools, key buckets, or esXai buckets
// https://arbiscan.io/address/0x68D78D1E81379EfD9C61f8E9131D52CE571AF4fD#readProxyContract
const beaconAddress = "0x5f9D168d3435747335b1B3dC7e4d42e3510087C7";
const currentContractImplementationName = "StakingPool2";
const newContractImplementationName = "StakingPool3";

const REFEREE_ADDRESS = config.refereeAddress;
const POOL_FACTORY_ADDRESS = config.poolFactoryAddress;
const NODE_LICENSE_ADDRESS = config.nodeLicenseAddress;

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());

    console.log("Upgrading Referee...");
    const Referee11 = await ethers.getContractFactory("Referee11", deployer);
    console.log("Got Referee factory");
    const referee11 = await upgrades.upgradeProxy(REFEREE_ADDRESS, Referee11);
    console.log("Referee upgraded to version 11");

    console.log("Upgrading PoolFactory...");
    const PoolFactory3 = await ethers.getContractFactory("PoolFactory3");
    console.log("Got PoolFactory factory");
    const poolFactory3 = await upgrades.upgradeProxy(POOL_FACTORY_ADDRESS, PoolFactory3);
    console.log("PoolFactory upgraded to version 3");
    
    console.log("Upgrading NodeLicense...");
    const NodeLicense10 = await ethers.getContractFactory("NodeLicense10");
    console.log("Got NodeLicense factory");
    const nodeLicense10 = await upgrades.upgradeProxy(NODE_LICENSE_ADDRESS, NodeLicense10);
    console.log("NodeLicense upgraded to version 10");

    // UPGRADE PoolBeacon
    // Create instance of the beacon
    const beacon = new ethers.Contract(beaconAddress, PoolBeaconAbi, deployer);
    console.log("Found beacon:", await beacon.getAddress());

    // Validate the new implementation is upgrade safe
    console.log("Validating upgrade viability...");
    const CurrentImplementationFactory = await ethers.getContractFactory(currentContractImplementationName);
    const NewImplementationFactory = await ethers.getContractFactory(newContractImplementationName);
    await upgrades.validateUpgrade(CurrentImplementationFactory, NewImplementationFactory, { kind: "beacon" });
    console.log("New implementation validated as upgrade safe");

    // Deploy the new implementation
    console.log("Deploying the new implementation");
    const NewImplementation = await ethers.deployContract(newContractImplementationName);
    await NewImplementation.waitForDeployment();
    const newImplementationAddress = await NewImplementation.getAddress();

    // Update the beacon with the new implementation address
    console.log("Updating the beacon with the new implementation address");
    await beacon.update(newImplementationAddress);

    console.log("Verifying the new PoolBeacon implementation");

    console.log("Starting verification... ");
    await safeVerify({ skipWaitForDeployTx: true, contractAddress: newImplementationAddress });
    await safeVerify({ skipWaitForDeployTx: true, contract: referee11 });
    await safeVerify({ skipWaitForDeployTx: true, contract: nodeLicense10 });
    await safeVerify({ skipWaitForDeployTx: true, contract: poolFactory3 });
    console.log("Verification complete ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
