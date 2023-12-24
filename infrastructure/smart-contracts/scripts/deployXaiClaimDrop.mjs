import { safeVerify } from "../utils/safeVerify.mjs";

// production push
// const referee = "0xfD41041180571C5D371BEA3D9550E55653671198";
// const xai = "0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66";
// const nodeLicense = "0xbc14d8563b248B79689ECbc43bBa53290e0b6b66";
// const allowanceAddress = "0x4eeD0c89fd49c61432D4030d5060E007fC0C68A2";
// const startTime = 1703635200;
// const endTime = startTime + 30 * 24 * 60 * 60;

// develop push
const referee = "";
const xai = "";
const nodeLicense = "";
const allowanceAddress = "";
const startTime = Date.now() / 1000;
const endTime = startTime + 30 * 24 * 60 * 60;

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("deployerAddress", deployerAddress);
  
    // deploy counter contract
    console.log("Deploying CounterContract...");
    const XaiGasslessClaimContract = await ethers.getContractFactory("XaiGasslessClaim");
    const xaiGaslessClaimContract = await upgrades.deployProxy(XaiGasslessClaimContract, [
        await deployer.getAddress(),
        xai,
        allowanceAddress,
        startTime,
        endTime,
        nodeLicense,
        referee
    ], { kind: "transparent", deployer });
    await xaiGaslessClaimContract.deploymentTransaction();
    const xaiGaslessClaimContractAddress = await xaiGaslessClaimContract.getAddress();
    console.log("CounterContract deployed to:", xaiGaslessClaimContractAddress);

    // verify contract
    await safeVerify({ contract: xaiGaslessClaimContract });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
