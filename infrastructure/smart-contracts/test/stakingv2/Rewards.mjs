import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {Contract} from "ethers";
import {BucketTrackerAbi, StakingPoolAbi} from "@sentry/core";

export function Rewards(deployInfrastructure, poolConfigurations) {
	const {
		poolMetaData,
		poolSocials,
		poolTrackerDetails,
		noDelegateOwner,
	} = poolConfigurations;

	const rewardModifier = 1_000_000;

	return function () {
		it("Verify the rewards are correct", async function () {
			const {poolFactory, addr1, addr2, addr3, nodeLicense, kycAdmin, referee, esXai, esXaiMinter} = await loadFixture(deployInfrastructure);


			// Mint key to make basic pool
			const addr1KeyQuantity = 1;
			const price = await nodeLicense.price(addr1KeyQuantity, "");
			await nodeLicense.connect(addr1).mint(addr1KeyQuantity, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			const ownerShare = 20_000; // 2 %
			const keyBucketShare = 843_750; // 84.375 %
			const esXaiBucketShare = 136_250; // 13.625 %

			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId],
				[
					ownerShare,
					keyBucketShare,
					esXaiBucketShare
				],
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Save reference to the new staking pool
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// addresses
			const addr2Address = await addr2.getAddress();
			const addr3Address = await addr3.getAddress();
			const poolFactoryAddress = await poolFactory.getAddress();

			// Mint a key to addr2 & stake
			const addr2KeysToStake = 1;
			const price2 = await nodeLicense.price(addr2KeysToStake, "");
			await nodeLicense.connect(addr2).mint(addr2KeysToStake, "", {value: price2});
			const mintedKeyId2 = await nodeLicense.totalSupply();
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [mintedKeyId2]);

			// Mint & stake 10 esXai for addr2
			const addr2EsXaiToStake = 10;
			await esXai.connect(esXaiMinter).mint(addr2Address, addr2EsXaiToStake);
			await esXai.connect(addr2).increaseAllowance(poolFactoryAddress, addr2EsXaiToStake);
			await poolFactory.connect(addr2).stakeEsXai(stakingPoolAddress, addr2EsXaiToStake);

			// Mint 10 keys to addr3 & stake
			const addr3KeysToStake = 10
			const price3 = await nodeLicense.price(addr3KeysToStake, "");
			await nodeLicense.connect(addr3).mint(addr3KeysToStake, "", {value: price3});
			const supplyAfterAddr3Mint = await nodeLicense.totalSupply();
			const addr3Keys = [];
			for (let i = mintedKeyId2; i < supplyAfterAddr3Mint; i++) {
				addr3Keys.push(i + 1n);
			}
			await referee.connect(kycAdmin).addKycWallet(addr3Address);
			await poolFactory.connect(addr3).stakeKeys(stakingPoolAddress, addr3Keys);

			// Mint & stake 100 esXai for addr3
			const addr3EsXaiToStake = 100;
			await esXai.connect(esXaiMinter).mint(addr3Address, addr3EsXaiToStake);
			await esXai.connect(addr3).increaseAllowance(poolFactoryAddress, addr3EsXaiToStake);
			await poolFactory.connect(addr3).stakeEsXai(stakingPoolAddress, addr3EsXaiToStake);

			// Mint 100,000 esXai to the stakingPool
			const poolAmount = 100_000;
			await esXai.connect(esXaiMinter).mint(stakingPoolAddress, poolAmount);
			const stakingPoolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(stakingPoolBalance).to.equal(poolAmount);

			// Calculate rewards for each bucket & amount per key/esXai
			const amountForKeyBucket = (poolAmount * keyBucketShare) / rewardModifier;
			const amountForEsXaiBucket = (poolAmount * esXaiBucketShare) / rewardModifier;
			const keyBucketTotalSupply = addr1KeyQuantity + addr2KeysToStake + addr3KeysToStake;
			const amountPerKey = amountForKeyBucket / keyBucketTotalSupply;
			const esXaiBucketTotalSupply = addr2EsXaiToStake + addr3EsXaiToStake;
			const amountPerEsXaiStaked = amountForEsXaiBucket / esXaiBucketTotalSupply;

			// Determine addr2 owed amount
			const addr2AmountFromKeys = addr2KeysToStake * amountPerKey;
			const addr2AmountFromEsXai = addr2EsXaiToStake * amountPerEsXaiStaked;
			const addr2TotalClaimAmount = addr2AmountFromKeys + addr2AmountFromEsXai;
			const addr2UndistributedClaimAmount1 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);
			expect(addr2UndistributedClaimAmount1[0]).to.equal(BigInt(Math.floor(addr2TotalClaimAmount)));

			// Determine addr3 owed amount
			const addr3AmountFromKeys = addr3KeysToStake * amountPerKey;
			const addr3AmountFromEsXai = addr3EsXaiToStake * amountPerEsXaiStaked;
			const addr3UndistributedClaimAmount1 = await stakingPool.connect(addr3).getUndistributedClaimAmount(addr3Address);
			const addr3TotalClaimAmount = addr3AmountFromKeys + addr3AmountFromEsXai;
			expect(addr3UndistributedClaimAmount1[0]).to.equal(BigInt(Math.floor(addr3TotalClaimAmount)));

			// addr2 claims from pool
			const addr2balance1Pre = await esXai.connect(addr2).balanceOf(addr2Address);
			await poolFactory.connect(addr2).claimFromPools([stakingPoolAddress]);
			const addr2balance1Post = await esXai.connect(addr2).balanceOf(addr2Address);
			expect(addr2balance1Post).to.equal(addr2balance1Pre + BigInt(Math.floor(addr2TotalClaimAmount)));

			// addr3 claims from pool
			const addr3balance1Pre = await esXai.connect(addr2).balanceOf(addr3Address);
			await poolFactory.connect(addr3).claimFromPools([stakingPoolAddress]);
			const addr3balance1Post = await esXai.connect(addr3).balanceOf(addr3Address);
			expect(addr3balance1Post).to.equal(addr3balance1Pre + BigInt(Math.floor(addr3TotalClaimAmount)));

			// Verify both users have no more undistributed claim amounts
			const addr2UndistributedClaimAmount2 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);
			const addr3UndistributedClaimAmount2 = await stakingPool.connect(addr3).getUndistributedClaimAmount(addr3Address);
			expect(addr2UndistributedClaimAmount2[0]).to.equal(0);
			expect(addr3UndistributedClaimAmount2[0]).to.equal(0);

			// Mint 1,000,000 esXai to the stakingPool
			const poolAmount2 = poolAmount * 10;
			await esXai.connect(esXaiMinter).mint(stakingPoolAddress, poolAmount2);
			const stakingPoolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			const poolOwnerClaimableRewards = await stakingPool.connect(addr1).poolOwnerClaimableRewards();
			expect(stakingPoolBalance2).to.equal(BigInt(poolAmount2) + poolOwnerClaimableRewards);

			// Re-calculate rewards for each bucket & amount per key/esXai
			const amountForKeyBucket2 = (poolAmount2 * keyBucketShare) / rewardModifier;
			const amountForEsXaiBucket2 = (poolAmount2 * esXaiBucketShare) / rewardModifier;
			const keyBucketTotalSupply2 = addr1KeyQuantity + addr2KeysToStake + addr3KeysToStake;
			const amountPerKey2 = amountForKeyBucket2 / keyBucketTotalSupply2;
			const esXaiBucketTotalSupply2 = addr2EsXaiToStake + addr3EsXaiToStake;
			const amountPerEsXaiStaked2 = amountForEsXaiBucket2 / esXaiBucketTotalSupply2;

			// Calculate new owed amount for addr2
			const addr2AmountFromKeys2 = addr2KeysToStake * amountPerKey2;
			const addr2AmountFromEsXai2 = addr2EsXaiToStake * amountPerEsXaiStaked2;
			const addr2TotalClaimAmount2 = addr2AmountFromKeys2 + addr2AmountFromEsXai2;
			const addr2UndistributedClaimAmount3 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);
			expect(addr2UndistributedClaimAmount3[0]).to.equal(BigInt(Math.floor(addr2TotalClaimAmount2)));

			// Calculate new owed amount for addr3
			const addr3AmountFromKeys2 = addr3KeysToStake * amountPerKey2;
			const addr3AmountFromEsXai2 = addr3EsXaiToStake * amountPerEsXaiStaked2;
			const addr3TotalClaimAmount2 = addr3AmountFromKeys2 + addr3AmountFromEsXai2;
			const addr3UndistributedClaimAmount3 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr3Address);
			expect(addr3UndistributedClaimAmount3[0]).to.equal(BigInt(Math.floor(addr3TotalClaimAmount2)));
		});

		it("Change reward breakdown does not effect reward value before 45 days are up", async function () {
			const {poolFactory, addr1, addr2, nodeLicense, esXai, esXaiMinter} = await loadFixture(deployInfrastructure);

			// Mint key to make basic pool
			const addr1KeyQuantity = 1;
			const price = await nodeLicense.price(addr1KeyQuantity, "");
			await nodeLicense.connect(addr1).mint(addr1KeyQuantity, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			const ownerShare1 = 50_000; // 5 %
			const keyBucketShare1 = 800_000; // 80 %
			const esXaiBucketShare1 = 150_000; // 15 %

			const ownerShare2 = 25_000; // 2.5 %
			const keyBucketShare2 = 700_000; // 70 %
			const esXaiBucketShare2 = 275_000; // 27.5 %

			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId],
				[
					ownerShare1,
					keyBucketShare1,
					esXaiBucketShare1
				],
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Save reference to the new staking pool
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// addresses
			const addr2Address = await addr2.getAddress();
			const poolFactoryAddress = await poolFactory.getAddress();

			// Mint a key to addr2 & stake
			const addr2KeysToStake = 1;
			const price2 = await nodeLicense.price(addr2KeysToStake, "");
			await nodeLicense.connect(addr2).mint(addr2KeysToStake, "", {value: price2});
			const mintedKeyId2 = await nodeLicense.totalSupply();
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [mintedKeyId2]);

			// Mint & stake 1000 esXai for addr2
			const addr2EsXaiToStake = 1000;
			await esXai.connect(esXaiMinter).mint(addr2Address, addr2EsXaiToStake);
			await esXai.connect(addr2).increaseAllowance(poolFactoryAddress, addr2EsXaiToStake);
			await poolFactory.connect(addr2).stakeEsXai(stakingPoolAddress, addr2EsXaiToStake);

			// Mint 100,000 esXai to the stakingPool
			const poolAmount = 100_000;
			await esXai.connect(esXaiMinter).mint(stakingPoolAddress, poolAmount);
			const stakingPoolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(stakingPoolBalance).to.equal(poolAmount);

			// Update the share values
			await poolFactory.connect(addr1).updateShares(
				stakingPoolAddress,
				[
					ownerShare2,
					keyBucketShare2,
					esXaiBucketShare2,
				],
			);

			// Calculate rewards for each bucket & amount per key/esXai for the initial share values
			const amountForKeyBucket = (poolAmount * keyBucketShare1) / rewardModifier;
			const amountForEsXaiBucket = (poolAmount * esXaiBucketShare1) / rewardModifier;
			const keyBucketTotalSupply = addr1KeyQuantity + addr2KeysToStake;
			const amountPerKey = amountForKeyBucket / keyBucketTotalSupply;
			const esXaiBucketTotalSupply = addr2EsXaiToStake;
			const amountPerEsXaiStaked = amountForEsXaiBucket / esXaiBucketTotalSupply;

			// Determine addr2 owed amount
			const addr2AmountFromKeys = addr2KeysToStake * amountPerKey;
			const addr2AmountFromEsXai = addr2EsXaiToStake * amountPerEsXaiStaked;
			const addr2TotalClaimAmount = addr2AmountFromKeys + addr2AmountFromEsXai;
			const addr2UndistributedClaimAmount1 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);
			expect(addr2UndistributedClaimAmount1[0]).to.equal(BigInt(Math.floor(addr2TotalClaimAmount)));

			// addr2 claim rewards
			const addr2balance1Pre = await esXai.connect(addr2).balanceOf(addr2Address);
			await poolFactory.connect(addr2).claimFromPools([stakingPoolAddress]);
			const addr2balance1Post = await esXai.connect(addr2).balanceOf(addr2Address);
			expect(addr2balance1Post).to.equal(addr2balance1Pre + BigInt(Math.floor(addr2TotalClaimAmount)));
		});

		it("Change reward breakdown changes reward value after 45 days", async function () {
			const {poolFactory, addr1, addr2, nodeLicense, esXai, esXaiMinter} = await loadFixture(deployInfrastructure);

			// Mint key to make basic pool
			const addr1KeyQuantity = 1;
			const price = await nodeLicense.price(addr1KeyQuantity, "");
			await nodeLicense.connect(addr1).mint(addr1KeyQuantity, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			const ownerShare1 = 50_000; // 5 %
			const keyBucketShare1 = 800_000; // 80 %
			const esXaiBucketShare1 = 150_000; // 15 %

			const ownerShare2 = 25_000; // 2.5 %
			const keyBucketShare2 = 700_000; // 70 %
			const esXaiBucketShare2 = 275_000; // 27.5 %

			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId],
				[
					ownerShare1,
					keyBucketShare1,
					esXaiBucketShare1
				],
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Save reference to the new staking pool
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// addresses
			const addr2Address = await addr2.getAddress();
			const poolFactoryAddress = await poolFactory.getAddress();

			// Mint a key to addr2 & stake
			const addr2KeysToStake = 1;
			const price2 = await nodeLicense.price(addr2KeysToStake, "");
			await nodeLicense.connect(addr2).mint(addr2KeysToStake, "", {value: price2});
			const mintedKeyId2 = await nodeLicense.totalSupply();
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [mintedKeyId2]);

			// Mint & stake 1000 esXai for addr2
			const addr2EsXaiToStake = 1000;
			await esXai.connect(esXaiMinter).mint(addr2Address, addr2EsXaiToStake);
			await esXai.connect(addr2).increaseAllowance(poolFactoryAddress, addr2EsXaiToStake);
			await poolFactory.connect(addr2).stakeEsXai(stakingPoolAddress, addr2EsXaiToStake);

			// Mint 100,000 esXai to the stakingPool
			const poolAmount = 100_000;
			await esXai.connect(esXaiMinter).mint(stakingPoolAddress, poolAmount);
			const stakingPoolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(stakingPoolBalance).to.equal(poolAmount);

			// Update the share values
			await poolFactory.connect(addr1).updateShares(
				stakingPoolAddress,
				[
					ownerShare2,
					keyBucketShare2,
					esXaiBucketShare2,
				],
			);

			// Calculate rewards for each bucket & amount per key/esXai for the initial share values
			const amountForKeyBucket = (poolAmount * keyBucketShare1) / rewardModifier;
			const amountForEsXaiBucket = (poolAmount * esXaiBucketShare1) / rewardModifier;
			const keyBucketTotalSupply = addr1KeyQuantity + addr2KeysToStake;
			const amountPerKey = amountForKeyBucket / keyBucketTotalSupply;
			const esXaiBucketTotalSupply = addr2EsXaiToStake;
			const amountPerEsXaiStaked = amountForEsXaiBucket / esXaiBucketTotalSupply;

			// Determine addr2 owed amount
			const addr2AmountFromKeys = addr2KeysToStake * amountPerKey;
			const addr2AmountFromEsXai = addr2EsXaiToStake * amountPerEsXaiStaked;
			const addr2TotalClaimAmount = addr2AmountFromKeys + addr2AmountFromEsXai;
			const addr2UndistributedClaimAmount1 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);
			expect(addr2UndistributedClaimAmount1[0]).to.equal(BigInt(Math.floor(addr2TotalClaimAmount)));

			// Wait 45 days
			await ethers.provider.send("evm_increaseTime", [86400 * 45]);
			await ethers.provider.send("evm_mine");

			// Calculate rewards for each bucket & amount per key/esXai for the updated share values
			const amountForKeyBucket2 = (poolAmount * keyBucketShare2) / rewardModifier;
			const amountForEsXaiBucket2 = (poolAmount * esXaiBucketShare2) / rewardModifier;
			const keyBucketTotalSupply2 = addr1KeyQuantity + addr2KeysToStake;
			const amountPerKey2 = amountForKeyBucket2 / keyBucketTotalSupply2;
			const esXaiBucketTotalSupply2 = addr2EsXaiToStake;
			const amountPerEsXaiStaked2 = amountForEsXaiBucket2 / esXaiBucketTotalSupply2;

			// Determine addr2 owed amount with updated shares
			const addr2AmountFromKeys2 = addr2KeysToStake * amountPerKey2;
			const addr2AmountFromEsXai2 = addr2EsXaiToStake * amountPerEsXaiStaked2;
			const addr2TotalClaimAmount2 = addr2AmountFromKeys2 + addr2AmountFromEsXai2;

			// addr2 claim rewards
			const addr2balance1Pre = await esXai.connect(addr2).balanceOf(addr2Address);
			await poolFactory.connect(addr2).claimFromPools([stakingPoolAddress]);
			const addr2balance1Post = await esXai.connect(addr2).balanceOf(addr2Address);
			expect(addr2balance1Post).to.equal(addr2balance1Pre + BigInt(Math.floor(addr2TotalClaimAmount2)));
		});
	}
}
