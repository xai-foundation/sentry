import { config, RefereeAbi } from "@sentry/core";
import { safeVerify } from "../../utils/safeVerify.mjs";

import { PoolBeaconAbi } from "@sentry/core";

// Find this in the deployed PoolProxyDeployer's public fields. This should reflect which set of proxies you want to change; staking pools, key buckets, or esXai buckets
// https://arbiscan.io/address/0x68D78D1E81379EfD9C61f8E9131D52CE571AF4fD#readProxyContract
const beaconAddress = "0x5f9D168d3435747335b1B3dC7e4d42e3510087C7";
const currentContractImplementationName = "StakingPool";
const newContractImplementationName = "StakingPool2";

const TINY_KEYS_AIRDROP_ADDRESS = "0x0209a0C0Abfe82916DF492D121667aCcA26C7eb0";
const REFEREE_ADDRESS = config.refereeAddress;

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());

    console.log("Close Open Challenge...");
    const referee = await new ethers.Contract(REFEREE_ADDRESS, RefereeAbi, deployer);
    await referee.closeCurrentChallenge();
    console.log("Closed Open Challenge");

    /**
     * Upgrade Referee Contract
     * @description Upgrades the existing Referee contract to Referee9
     * @param {string} refereeCalculationsAddress - Address of the RefereeCalculations contract
     */
    console.log("Upgrading Referee...");
    const Referee10 = await ethers.getContractFactory("Referee10", deployer);
    console.log("Got Referee factory");

    const referee10 = await upgrades.upgradeProxy(REFEREE_ADDRESS, Referee10, { call: { fn: "initialize", args: [] } });
    console.log("Referee upgraded to version 10");

    // Deploy PoolFactory update switch to keyAmounts
    console.log("Upgrading PoolFactory...");
    const PoolFactory2 = await ethers.getContractFactory("PoolFactory2");
    console.log("Got PoolFactory factory");
    const poolFactory2 = await upgrades.upgradeProxy(POOL_FACTORY_ADDRESS, PoolFactory2, { redeployImplementation: 'always' });

    console.log("Deploying Tiny Keys Airdrop...");
    const TinyKeysAirdrop = await ethers.getContractFactory("TinyKeysAirdrop");
    const tinyKeysAirdrop = await upgrades.upgradeProxy(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdrop, { redeployImplementation: 'always' });
    console.log("Tiny Keys Airdrop upgraded");

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
    await safeVerify({ skipWaitForDeployTx: true, contract: referee10 });
    await safeVerify({ skipWaitForDeployTx: true, contract: tinyKeysAirdrop });
    await safeVerify({ skipWaitForDeployTx: true, contract: poolFactory2 });
    console.log("Verification complete ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
