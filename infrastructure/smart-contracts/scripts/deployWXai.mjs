async function main() {
	// get the deployer
	const [deployer] = await ethers.getSigners();
	const deployerAddress = await deployer.getAddress();
	console.log("Deployer Address:", deployerAddress);

	// deploy WETH9 contract
	console.log("Deploying WETH9 Contract...");
	const WETH9Contract = await ethers.getContractFactory("WETH9");
	const weth9 = await WETH9Contract.deploy();
	console.log("WETH9 Contract deployed to:", weth9.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
