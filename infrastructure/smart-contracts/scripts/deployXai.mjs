import { safeVerify } from "../utils/safeVerify.mjs";

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
  
    // deploy xai contract
    console.log("Deploying Xai...");
    const Xai = await ethers.getContractFactory("Xai");
    const xai = await upgrades.deployProxy(Xai, [], { kind: "transparent", deployer });
    await xai.deploymentTransaction();
    const xaiAddress = await xai.getAddress();
    console.log("Xai deployed to:", xaiAddress);

    // add the minter role
    const xaiMinterRole = await xai.MINTER_ROLE();
    await xai.grantRole(xaiMinterRole, deployerAddress);

    // verify contract
    await safeVerify({ contract: xai });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  