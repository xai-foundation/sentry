import csv from "csvtojson";
import fs from "fs";
import {Contract} from "ethers";
import {config, RefereeAbi} from "@sentry/core";

const wei = 1000000000000000000n;
const baseReward = 80;
const multipleReward = 8;
async function getCNYClaimRewards(deployer) {
	const holders = await csv().fromFile("./assets/csv-input/xai-sentry-holders-cny.csv");

	const rewards = new Map();
	const refereeContract = new Contract(config.refereeAddress, RefereeAbi);

	for (const holder of holders) {
		const meKYC = await refereeContract.connect(deployer).isKycApproved(holder.HolderAddress);

		if (!meKYC) {
			continue;
		}

		const quantity = BigInt(baseReward + (holder.Quantity * multipleReward));
		rewards.set(holder.HolderAddress, quantity * wei);
	}

	// Create the csv & json
	let walletXaiCsv = "Wallet,Xai CNY Reward\n";
	const json = [];
	let total = 0n;

	for (const [wallet, quantity] of rewards.entries()) {
		walletXaiCsv += `${wallet},${quantity.toString()}` + "\n";
		json.push({userWalletAddress: wallet.toLowerCase(), amount: quantity.toString()});
		total += BigInt(quantity);
	}

	await fs.writeFile("./assets/csv-output/xai-sentry-holders-cny.csv", walletXaiCsv, {}, () => {});
	await fs.writeFile("./assets/csv-output/xai-sentry-holders-cny.json", JSON.stringify(json, null, 2), {}, () => {});

	console.log("total xai:", total);
}

const [deployer] = (await ethers.getSigners());
getCNYClaimRewards(deployer).then(() => {
	console.log("Done!")
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
})
