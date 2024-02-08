import {safeVerify} from "../utils/safeVerify.mjs";

// develop push
const xai = "0x1E8C33e287836bB45c3fC644aa9038391b6F561d";
const nodeLicense = "0x8083285f586b18a25A517a7081AA456B3048c5EB";
const allowanceAddress = "0xbecbba84BF2d109A4154AAc8f9F9DDDA0808fA95";
const startTime = Math.round(Date.now() / 1000);
const endTime = Math.round(startTime + (60 * 60 * 24 * 14));

console.log("startTime:", startTime);
console.log("endTime:", endTime);

async function main() {

	// get the deployer
	const [deployer] = (await ethers.getSigners());
	const deployerAddress = await deployer.getAddress();
	console.log("deployerAddress", deployerAddress);
	console.log("provider", deployer.provider);

	// deploy red envelope contract
	console.log("Deploying Xai Red Envelope...");
	const XaiRedEnvelopeContract = await ethers.getContractFactory("XaiRedEnvelope");
	const xaiRedEnvelopeContract = await upgrades.deployProxy(XaiRedEnvelopeContract, [
		await deployer.getAddress(),
		xai,
		allowanceAddress,
		startTime,
		endTime,
		nodeLicense
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
