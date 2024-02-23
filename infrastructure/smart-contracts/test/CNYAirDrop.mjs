import {runCNYAirDrop} from "../scripts/runCNYAirDrop.mjs";
import {Contract} from "ethers";
import { expect } from "chai";
import {config, XaiAbi} from "@sentry/core";
import holders from "../assets/csv-output/xai-sentry-holders-cny.json" assert {type: "json"};

export function CNYAirDropTests() {
	it("Test air drop", async function() {
		const deployer = await ethers.getImpersonatedSigner("0xA812b027D2ea8268c76883A19e4864E0766A863b");
		const fromAddress = await ethers.getImpersonatedSigner("0xcae28c3fbec7b206c5d99df0a4cbc523fa9608ba");

		const [addr1] = (await ethers.getSigners());
		await addr1.sendTransaction({to: deployer.address, value: 2000000000000000000n});

		const xaiContract = new Contract(config.xaiAddress, XaiAbi);
		await xaiContract.connect(fromAddress).approve(deployer.address, 800000000000000000000000n); // 800000 xai

		const balances = {};
		for (const holder of holders) {
			balances[holder.userWalletAddress] = await xaiContract.connect(deployer).balanceOf(holder.userWalletAddress);
		}

		await runCNYAirDrop(deployer, fromAddress.address);

		for (const holder of holders) {
			const updatedBalance = await xaiContract.connect(deployer).balanceOf(holder.userWalletAddress);
			expect(updatedBalance).to.equal(balances[holder.userWalletAddress] + BigInt(holder.amount));
		}
	}).timeout(3000000);
}
