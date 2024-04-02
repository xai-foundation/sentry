import fs from "fs";
import { signERC2612Permit } from "../utils/signERC2612Permit.mjs";
import {config} from "@sentry/core";

const PATH_TO_CLAIM_AMOUNTS = "./assets/csv-output/xai-sentry-holders-cny.json";
const GASLESS_CLAIM_ADDRESS = config.xaiRedEnvelope2024Address;
console.log("GASLESS_CLAIM_ADDRESS:", GASLESS_CLAIM_ADDRESS);
const CHAIN_ID = 42161;
const NONCE_PER_RUN = 0;
const OUTPUT_FILE = "../../apps/web-connect/public/xai-drop-permits-cny.JSON";

async function main() {
	const permitAdmin = (await ethers.getSigners())[0];
	const permitAdminAddress = await permitAdmin.getAddress();
	console.log(`Permit Admin Address: ${permitAdminAddress}`);

	// read the file of amounts
	const claimAmounts = JSON.parse(fs.readFileSync(PATH_TO_CLAIM_AMOUNTS, 'utf8'));

	// create list of permits
	const permits = {};
	const batchSize = 10;
	let batchCount = 0;
	for (let i = 0; i < claimAmounts.length; i += batchSize) {
		const batch = claimAmounts.slice(i, i + batchSize);
		const startTime = Date.now();
		const promises = batch.map(async ({userWalletAddress, amount}) => {
			const startTime = Date.now();
			const signature = await signERC2612Permit(
				GASLESS_CLAIM_ADDRESS,
				CHAIN_ID,
				userWalletAddress,
				amount,
				process.env.MNEMONIC,
				0,
				permitAdmin,
				NONCE_PER_RUN,
				"XaiRedEnvelope"
			);
			const endTime = Date.now();
			const timeTaken = endTime - startTime;
			console.log(`Permit creation for ${userWalletAddress} took ${timeTaken} ms`);
			return {userWalletAddress, signature, timeTaken, amount};
		});
		const results = await Promise.all(promises);
		results.forEach(({userWalletAddress, signature, timeTaken, amount}) => {
			permits[userWalletAddress] = {...signature, amount};
			console.log(`Batch ${batchCount + 1} - Permit creation for ${userWalletAddress} took ${timeTaken} ms`);
		});
		const batchEndTime = Date.now();
		const batchTimeTaken = batchEndTime - startTime;
		console.log(`Batch ${batchCount + 1} completed in ${batchTimeTaken} ms. ${batchCount + 1} / ${Math.ceil(claimAmounts.length / batchSize)} batches completed.`);
		batchCount++;
	}

	// save permit list file into the web public directory
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(permits, null, 2), 'utf8');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
