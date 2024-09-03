import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;


export async function sourcifyVerify(contractAddress) {
    console.log(`Attempting to Verify using Sourcify: ${contractAddress}`);

    try {
        await hre.run("verify", { address: contractAddress });
    } catch (e) {
        console.error("Failed to run verify ", e);
    }

    console.log("Verified!");
}

(async () => {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    const contractFactory = await ethers.getContractFactory("Forwarder");

    console.log("Deploying Forwarder...");

    const contract = await upgrades.deployProxy(contractFactory, [], { deployer: deployer });

    await contract.waitForDeployment();

    const deployedContractAddress = await contract.getAddress();

    console.log("Forwarder deployed to: ", deployedContractAddress);

    await sourcifyVerify(deployedContractAddress);

})();

