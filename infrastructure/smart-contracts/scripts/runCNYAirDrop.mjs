import {Contract} from "ethers";
import {config, XaiAbi} from "@sentry/core";
import fs from "fs/promises";
// import holders from "../assets/csv-output/xai-sentry-holders-cny.json" assert {type: "json"};
// import progress from "../assets/csv-output/cny-airdrop-progress.json" assert {type: "json"};

export async function runCNYAirDrop(deployer, fromAddress) {
	// const progressLocal = progress;
	// const totalHolders = Object.entries(holders).length;
	//
	// const contract = new Contract(config.xaiAddress, XaiAbi);
	//
	// try {
	// 	for (const holder of holders) {
	// 		if (progressLocal.indexOf(holder.userWalletAddress) > -1) {
	// 			continue;
	// 		}
	//
	// 		await contract.connect(deployer).transferFrom(fromAddress, holder.userWalletAddress, holder.amount);
	//
	// 		const myIndex = holders.findIndex(h => h.userWalletAddress === holder.userWalletAddress)
	// 		console.log(`Transferred ${holder.amount} to ${holder.userWalletAddress} (${myIndex + 1} of ${totalHolders}).`);
	// 		progressLocal.push(holder.userWalletAddress);
	// 	}
	// } catch (err) {
	// 	await fs.writeFile("./assets/csv-output/cny-airdrop-progress.json", JSON.stringify(progressLocal), {}, () => {});
	// 	throw err;
	// }
	//
	// await fs.writeFile("./assets/csv-output/cny-airdrop-progress.json", JSON.stringify(progressLocal), {}, () => {});
}

const [deployer] = (await ethers.getSigners());
const fromAddress = "0xec57C2bF6B40F9eC0229c13be046087ABA59E9e1";
// runCNYAirDrop(deployer, fromAddress).then(() => {
// 	console.log("Done CNY air drop!")
// }).catch((error) => {
// 	console.error(error);
// 	process.exitCode = 1;
// });
