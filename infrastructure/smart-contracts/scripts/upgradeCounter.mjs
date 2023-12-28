import { safeVerify } from "../utils/safeVerify.mjs";

const address = "0xd534740B1c0b4FFd21AA4CC520b23d661cae66cC";

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("deployerAddress", deployerAddress);

    // get the artifact
    const CounterContract = await ethers.getContractFactory("CounterContract2");
  
    // deploy counter contract
    const implementationAddress = await upgrades.prepareUpgrade(address, CounterContract, {kind: "transparent"});

    // verify contract
    await safeVerify({ contractAddress: implementationAddress });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
