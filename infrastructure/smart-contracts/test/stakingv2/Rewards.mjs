import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";

export function Rewards(deployInfrastructure, poolConfigurations) {
	const {
		poolMetaData,
		poolSocials,
		poolTrackerDetails,
		noDelegateOwner,
	} = poolConfigurations;

	return function () {
		// it("Verify the rewards are correct", async function () {
		// 	const {poolFactory, addr1, nodeLicense, referee, refereeDefaultAdmin, esXai, esXaiMinter} = await loadFixture(deployInfrastructure);
		//
		// 	// Mint key to make basic pool
		// 	const price = await nodeLicense.price(1, "");
		// 	await nodeLicense.connect(addr1).mint(1, "", {value: price});
		// 	const mintedKeyId = await nodeLicense.totalSupply();
		//
		// 	await poolFactory.connect(addr1).createPool(
		// 		noDelegateOwner,
		// 		[mintedKeyId],
		// 		[
		// 			20_000,
		// 			929_900,
		// 			50_100,
		// 		],
		// 		poolMetaData,
		// 		poolSocials,
		// 		poolTrackerDetails
		// 	);
		//
		// 	// Save the new pool's address
		// 	const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
		//
		// 	const esXaiToStake = 11_000
		// 	await esXai.connect(esXaiMinter).mint(await addr1.getAddress(), esXaiToStake);
		// 	await esXai.connect(addr1).increaseAllowance(await poolFactory.getAddress(), esXaiToStake);
		// 	await poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, esXaiToStake);
		// });
	}
}
