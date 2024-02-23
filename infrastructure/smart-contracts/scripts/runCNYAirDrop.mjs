import {Contract} from "ethers";
import {config, XaiAbi} from "@sentry/core";
import fs from "fs/promises";
import holders from "../assets/csv-output/xai-sentry-holders-cny.json" assert {type: "json"};
import progress from "../assets/csv-output/cny-airdrop-progress.json" assert {type: "json"};

async function runCNYAirDrop() {
	const progressLocal = progress;

	const [deployer] = (await ethers.getSigners());
	const deployerAddress = await deployer.getAddress();

	const contract = new Contract(config.xaiAddress, XaiAbi);

	const totalHolders = Object.entries(holders).length;

	try {
		for (const holder of holders) {
			if (progressLocal.indexOf(holder.userWalletAddress) > -1) {
				continue;
			}

			// await contract.connect(deployerAddress).transferFrom("TODO", holder.userWalletAddress, holder.amount);

			const myIndex = holders.findIndex(h => h.userWalletAddress === holder.userWalletAddress)
			console.log(`Transferred ${holder.amount} to ${holder.userWalletAddress} (${myIndex + 1} of ${totalHolders}).`);
			progressLocal.push(holder.userWalletAddress);
		}
	} catch (err) {
		await fs.writeFile("./assets/csv-output/cny-airdrop-progress.json", JSON.stringify(progressLocal), {}, () => {});
		throw err;
	}

	await fs.writeFile("./assets/csv-output/cny-airdrop-progress.json", JSON.stringify(progressLocal), {}, () => {});
}

runCNYAirDrop().then(() => {
	console.log("Done CNY air drop!")
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
