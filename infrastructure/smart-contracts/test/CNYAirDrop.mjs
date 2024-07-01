import {runCNYAirDrop} from "../scripts/runCNYAirDrop.mjs";
import { expect } from "chai";
import {config, XaiAbi} from "@sentry/core";
// import holders from "../assets/csv-output/xai-sentry-holders-cny.json" assert {type: "json"};

export function CNYAirDropTests() {
	// it("Test air drop", async function() {
	// 	const deployer = await ethers.getImpersonatedSigner("0xA812b027D2ea8268c76883A19e4864E0766A863b");
	// 	console.log(deployer.address)
	//
	// 	const xaiContract = new ethers.Contract(config.xaiAddress, XaiAbi);
	// 	const allowance = await xaiContract.connect(deployer).allowance("0xec57C2bF6B40F9eC0229c13be046087ABA59E9e1", deployer.address);
	// 	console.log(allowance);
	//
	// 	const balances = {};
	// 	for (const holder of holders) {
	// 		balances[holder.userWalletAddress] = await xaiContract.connect(deployer).balanceOf(holder.userWalletAddress);
	// 		console.log(holder.userWalletAddress, balances[holder.userWalletAddress]);
	// 	}
	//
	// 	await runCNYAirDrop(deployer, "0xec57C2bF6B40F9eC0229c13be046087ABA59E9e1");
	//
	// 	for (const holder of holders) {
	// 		const updatedBalance = await xaiContract.connect(deployer).balanceOf(holder.userWalletAddress);
	// 		expect(updatedBalance).to.equal(balances[holder.userWalletAddress] + BigInt(holder.amount));
	// 	}
	// }).timeout(3000000);
}
