import hardhat from "hardhat";
const { ethers, upgrades } = hardhat;

const XAI_ADDRESS = "0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66";
const ESXAI_ADDRESS = "0x4C749d097832DE2FEcc989ce18fDc5f1BD76700c";
const POOLFACTORY_ADDRESS = "0xF9E08660223E2dbb1c0b28c82942aB6B5E38b8E5";
const INITIAL_OWNER_MULTISIG = "" //TODO Set the Proxy Admin Owner to the mainnet multisig account

async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);

    console.log("Deploying Voting Upgradable...");
    const Voting = await ethers.getContractFactory("XaiVoting");

    const voting = await upgrades.deployProxy(
        Voting,
        [XAI_ADDRESS, ESXAI_ADDRESS, POOLFACTORY_ADDRESS],
        { kind: "transparent", deployer, initialOwner: INITIAL_OWNER_MULTISIG }
    );

    const tx = await voting.deploymentTransaction();
    await tx.wait(3);
    const votingAddress = await voting.getAddress();
    console.log("Voting deployed to:", votingAddress);

    console.log("Starting verification... ");

    await run("verify:verify", {
        address: votingAddress,
        constructorArguments: []
    });


    console.log("Deployed contracts");
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});