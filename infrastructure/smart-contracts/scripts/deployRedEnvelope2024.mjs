import {safeVerify} from "../utils/safeVerify.mjs";

const referee = "0xfD41041180571C5D371BEA3D9550E55653671198";
const xai = "0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66";
const nodeLicense = "0xbc14d8563b248B79689ECbc43bBa53290e0b6b66";
const allowanceAddress = "0x1F941F7Fb552215af81e6bE87F59578C18783483";

const submissionStartTime = 1707465600;
const submissionEndTime = 1708642800;

const claimStartTime = 1708729200;
const claimEndTime = 1711407600;

async function main() {

	// get the deployer
	const [deployer] = (await ethers.getSigners());
	const deployerAddress = await deployer.getAddress();
	console.log("deployerAddress", deployerAddress);

	// deploy red envelope contract
	console.log("Deploying Xai Red Envelope...");
	const XaiRedEnvelopeContract = await ethers.getContractFactory("XaiRedEnvelope");
	const xaiRedEnvelopeContract = await upgrades.deployProxy(XaiRedEnvelopeContract, [
		await deployer.getAddress(),
		xai,
		allowanceAddress,
		submissionStartTime,
		submissionEndTime,
		claimStartTime,
		claimEndTime,
		nodeLicense,
		referee
	], { kind: "transparent", deployer });
	await xaiRedEnvelopeContract.deploymentTransaction();
	const xaiRedEnvelopeContractAddress = await xaiRedEnvelopeContract.getAddress();
	console.log("Xai Red Envelope deployed to:", xaiRedEnvelopeContractAddress);

	// verify contract
	await safeVerify({ contract: xaiRedEnvelopeContract });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
