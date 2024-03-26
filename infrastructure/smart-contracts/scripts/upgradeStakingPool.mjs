import {Contract} from "ethers";
import {PoolBeaconAbi} from "@sentry/core";

// Find this in the deployed PoolProxyDeployer's public fields. This should reflect which set of proxies you want to change; stkaing pools, key buckets, or esXai buckets
const beaconAddress = "0x";
const currentContractImplementationName = "";
const newContractImplementationName = "";

async function main() {
	// Grab the deployer
	const [deployer] = (await ethers.getSigners());
	const deployerAddress = await deployer.getAddress();
	console.log("Deployer address", deployerAddress);

	// Create instance of the beacon
	const beacon = new Contract(beaconAddress, PoolBeaconAbi);
	console.log("Found beacon:", await beacon.getAddress());

	// Validate the new implementation is upgrade safe
	console.log("Validating upgrade viability...");
	const CurrentImplementationFactory = await ethers.getContractFactory(currentContractImplementationName);
	const NewImplementationFactory = await ethers.getContractFactory(newContractImplementationName);
	const currentContractImplementationAddress = await beacon.implementation();
	const currentImplementation = await upgrades.forceImport(currentContractImplementationAddress, CurrentImplementationFactory);
	await upgrades.validateUpgrade(currentImplementation, NewImplementationFactory);
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
