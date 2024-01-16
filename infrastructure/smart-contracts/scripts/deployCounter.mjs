import { safeVerify } from "../utils/safeVerify.mjs";

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("deployerAddress", deployerAddress);
  
    // deploy counter contract
    console.log("Deploying CounterContract...");
    const CounterContract = await ethers.getContractFactory("CounterContract");
    const counterContract = await upgrades.deployProxy(CounterContract, [], { kind: "transparent", deployer });
    const tx = await counterContract.deploymentTransaction();
    await tx.wait(3);
    const counterContractAddress = await counterContract.getAddress();
    console.log("CounterContract deployed to:", counterContractAddress);

    // add the counter role to an array of addresses
    // wait for next block
    const counterRole = await counterContract.COUNTER_ROLE();
    const addresses = ["0xfeBC06428a15C6618Baa5589C3E9C40ACF71aA79", "0x8F1B661C5D4eFbf7A9C72DA1445C3d7B23F856c7", "0xFCF7248C495d6fd3641eE43F861c48Ebe402c878", "0x085F4324F945Fb69bF4C474e9dd5f8046AE9962C", "0x7eC7e03563f781ED4c56BBC4c5F28C1B4dB932ff"];
    for (const address of addresses) {
        await counterContract.grantRole(counterRole, address);
    }

    // verify contract
    await safeVerify({ contract: counterContract });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
