import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";

export function StakingV2(deployInfrastructure) {
	return function () {
		describe("Staking V2", function () {
			it("Check that the shares cannot go over the max values (bucketshareMaxValues = ordered owner, keys, esXaiStaker)", async function () {
				const {referee, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

				// Mint a node key & save the id
				const price = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price});
				const mintedKeyId = await nodeLicense.totalSupply();

				// Create a pool
				// const bucketShareMaxValues = await referee.connect(addr1);
				const bucketShareMaxValues = await referee.connect(addr1).bucketshareMaxValues;
				// bucketShareMaxValues.wait();
				console.log("bucketShareMaxValues:", bucketShareMaxValues)

			// 	await expect(
			// 		referee.connect(addr1).createPool(
			// 			[mintedKeyId],
			// 			bucketShareMaxValues[0] + 1,
			// 			bucketShareMaxValues[1] + 1,
			// 			bucketShareMaxValues[2] + 1,
			// 			"Testing Pool",
			// 			"This is for testing purposes only!!",
			// 			"logo",
			// 			"website",
			// 			"twitter",
			// 			"discord",
			// 			"telegram",
			// 			"instagram",
			// 			"tiktok",
			// 			"youtube"
			// 		)
			// 	).to.be.revertedWith("");//todo reason
			})
		});
	}
}
