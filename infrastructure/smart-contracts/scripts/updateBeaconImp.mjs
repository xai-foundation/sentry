import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;

import { PoolBeaconAbi } from "@sentry/core";

// Find this in the deployed PoolProxyDeployer's public fields. This should reflect which set of proxies you want to change; staking pools, key buckets, or esXai buckets
const beaconAddress = "0x27e57D41D633E9ea30326911aC3E19F203099c12";     //TODO Update to the beacon contract that needs to be updated
const currentContractImplementationName = "StakingPool";                //TODO Update to the contract name of the previous implementation
const newContractImplementationName = "StakingPool2";                   //TODO Update to the contract name of the new implementation

async function main() {
    // Grab the deployer
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

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

    console.log("Verifying the new implementation");
    await run("verify:verify", {
        address: newImplementationAddress,
        constructorArguments: [],
    });

    console.log("Done!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
