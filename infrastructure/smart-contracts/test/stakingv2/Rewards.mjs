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
		validShareValues,
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
			expect(addr2UndistributedClaimAmount1[2]).to.equal(BigInt(Math.floor(addr2TotalClaimAmount)));

			// Determine addr3 owed amount
			const addr3AmountFromKeys = addr3KeysToStake * amountPerKey;
			const addr3AmountFromEsXai = addr3EsXaiToStake * amountPerEsXaiStaked;
			const addr3UndistributedClaimAmount1 = await stakingPool.connect(addr3).getUndistributedClaimAmount(addr3Address);
			const addr3TotalClaimAmount = addr3AmountFromKeys + addr3AmountFromEsXai;
			expect(addr3UndistributedClaimAmount1[2]).to.equal(BigInt(Math.floor(addr3TotalClaimAmount)));

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
			expect(addr2UndistributedClaimAmount2[2]).to.equal(0);
			expect(addr3UndistributedClaimAmount2[2]).to.equal(0);

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
			expect(addr2UndistributedClaimAmount3[2]).to.equal(BigInt(Math.floor(addr2TotalClaimAmount2)));

			// Calculate new owed amount for addr3
			const addr3AmountFromKeys2 = addr3KeysToStake * amountPerKey2;
			const addr3AmountFromEsXai2 = addr3EsXaiToStake * amountPerEsXaiStaked2;
			const addr3TotalClaimAmount2 = addr3AmountFromKeys2 + addr3AmountFromEsXai2;
			const addr3UndistributedClaimAmount3 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr3Address);
			expect(addr3UndistributedClaimAmount3[2]).to.equal(BigInt(Math.floor(addr3TotalClaimAmount2)));
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
			expect(addr2UndistributedClaimAmount1[2]).to.equal(BigInt(Math.floor(addr2TotalClaimAmount)));

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
			expect(addr2UndistributedClaimAmount1[2]).to.equal(BigInt(Math.floor(addr2TotalClaimAmount)));

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

		it("Check reward distribution is correct if staking into pool after pool gets", async function () {
			const {poolFactory, addr1, addr2, addr3, addr4, nodeLicense, esXai, esXaiMinter, referee, kycAdmin} = await loadFixture(deployInfrastructure);

			const ownerShare = 20_000; // 2 %
			const keyBucketShare = 843_750; // 84.375 %
			const esXaiBucketShare = 136_250; // 13.625 %

			// Mint key to make basic pool
			const addr1KeyQuantity = 1;
			const price = await nodeLicense.price(addr1KeyQuantity, "");
			await nodeLicense.connect(addr1).mint(addr1KeyQuantity, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId],
				[
					ownerShare,
					keyBucketShare,
					esXaiBucketShare,
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
			const addr4Address = await addr4.getAddress();
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
			expect(addr2UndistributedClaimAmount1[2]).to.equal(BigInt(Math.floor(addr2TotalClaimAmount)));

			// Determine addr3 owed amount
			const addr3AmountFromKeys = addr3KeysToStake * amountPerKey;
			const addr3AmountFromEsXai = addr3EsXaiToStake * amountPerEsXaiStaked;
			const addr3UndistributedClaimAmount1 = await stakingPool.connect(addr3).getUndistributedClaimAmount(addr3Address);
			const addr3TotalClaimAmount = addr3AmountFromKeys + addr3AmountFromEsXai;
			expect(addr3UndistributedClaimAmount1[2]).to.equal(BigInt(Math.floor(addr3TotalClaimAmount)));

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
			expect(addr2UndistributedClaimAmount2[2]).to.equal(0);
			expect(addr3UndistributedClaimAmount2[2]).to.equal(0);

			// Mint 100,000 esXai to the stakingPool
			const poolAmount2 = poolAmount;
			await esXai.connect(esXaiMinter).mint(stakingPoolAddress, poolAmount2);
			const stakingPoolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			const poolOwnerClaimableRewards = await stakingPool.connect(addr1).poolOwnerClaimableRewards();
			expect(stakingPoolBalance2).to.equal(BigInt(poolAmount2) + poolOwnerClaimableRewards);

			// Check that addr2 & addr3 have the same claim amounts as the first iteration (because same amount was minted to pool again)
			const addr2UndistributedClaimAmount3 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);
			const addr3UndistributedClaimAmount3 = await stakingPool.connect(addr3).getUndistributedClaimAmount(addr3Address);
			expect(addr2UndistributedClaimAmount3[2]).to.equal(addr2UndistributedClaimAmount1[2]);
			expect(addr3UndistributedClaimAmount3[2]).to.equal(addr3UndistributedClaimAmount1[2]);

			// Expect addr4 to have no esXai yet
			const addr4balance1 = await esXai.connect(addr3).balanceOf(addr4Address);
			expect(addr4balance1).to.equal(0);

			// Mint a key to addr4 & stake
			const addr4KeysToStake = 1;
			const price4 = await nodeLicense.price(addr4KeysToStake, "");
			await nodeLicense.connect(addr4).mint(addr4KeysToStake, "", {value: price4});
			const mintedKeyId4 = await nodeLicense.totalSupply();
			await referee.connect(kycAdmin).addKycWallet(addr4Address);
			await poolFactory.connect(addr4).stakeKeys(stakingPoolAddress, [mintedKeyId4]);

			// Stake no esXai as addr4...
			const addr4EsXaiToStake = 0;

			// Expect addr4 to still have no esXai
			const addr4balance2 = await esXai.connect(addr3).balanceOf(addr4Address);
			expect(addr4balance2).to.equal(0);

			// addr4 claims from pool & verify esXai balance is still 0
			const addr4balance3 = await esXai.connect(addr4).balanceOf(addr4Address);
			await poolFactory.connect(addr4).claimFromPools([stakingPoolAddress]);
			const addr4balance4 = await esXai.connect(addr4).balanceOf(addr4Address);
			expect(addr4balance4).to.equal(addr4balance3).to.equal(0);

			// addr2 claims from pool
			await poolFactory.connect(addr2).claimFromPools([stakingPoolAddress]);
			const addr2balance1Post2 = await esXai.connect(addr2).balanceOf(addr2Address);
			expect(addr2balance1Post2).to.equal(addr2balance1Post + BigInt(Math.round(addr2TotalClaimAmount)));

			// addr3 claims from pool
			await poolFactory.connect(addr3).claimFromPools([stakingPoolAddress]);
			const addr3balance1Post2 = await esXai.connect(addr3).balanceOf(addr3Address);
			expect(addr3balance1Post2).to.equal(addr3balance1Post + BigInt(Math.round(addr3TotalClaimAmount)));

			// Mint 100,000 esXai to the stakingPool
			const poolAmount3 = poolAmount;
			await esXai.connect(esXaiMinter).mint(stakingPoolAddress, poolAmount3);
			const stakingPoolBalance3 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			const poolOwnerClaimableRewards2 = await stakingPool.connect(addr1).poolOwnerClaimableRewards();
			expect(stakingPoolBalance3).to.equal(BigInt(poolAmount3) + poolOwnerClaimableRewards2);

			// Calculate new expected claimable amounts
			const amountForKeyBucket4 = (poolAmount3 * keyBucketShare) / rewardModifier;
			const amountForEsXaiBucket4 = (poolAmount3 * esXaiBucketShare) / rewardModifier;
			const keyBucketTotalSupply4 = addr1KeyQuantity + addr2KeysToStake + addr3KeysToStake + addr4KeysToStake;
			const amountPerKey4 = Number((amountForKeyBucket4 / keyBucketTotalSupply4)).toFixed(4);
			const esXaiBucketTotalSupply4 = addr2EsXaiToStake + addr3EsXaiToStake + addr4EsXaiToStake;
			const amountPerEsXaiStaked4 = Number((amountForEsXaiBucket4 / esXaiBucketTotalSupply4).toFixed(4));

			// Determine addr2 owed amount
			const addr2AmountFromKeys4 = Math.floor(addr2KeysToStake * amountPerKey4);
			const addr2AmountFromEsXai4 = Math.floor(addr2EsXaiToStake * amountPerEsXaiStaked4);
			const addr2TotalClaimAmount4 = addr2AmountFromKeys4 + addr2AmountFromEsXai4;
			const addr2UndistributedClaimAmount4 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);

			// Determine addr3 owed amount
			const addr3AmountFromKeys4 = Math.floor(addr3KeysToStake * amountPerKey4);
			const addr3AmountFromEsXai4 = Math.floor(addr3EsXaiToStake * amountPerEsXaiStaked4);
			const addr3TotalClaimAmount4 = addr3AmountFromKeys4 + addr3AmountFromEsXai4;
			const addr3UndistributedClaimAmount4 = await stakingPool.connect(addr3).getUndistributedClaimAmount(addr3Address);

			// Determine addr4 owed amount
			const addr4AmountFromKeys4 = Math.floor(addr4KeysToStake * amountPerKey4);
			const addr4AmountFromEsXai4 = Math.floor(addr4EsXaiToStake * amountPerEsXaiStaked4);
			const addr4TotalClaimAmount4 = addr4AmountFromKeys4 + addr4AmountFromEsXai4;
			const addr4UndistributedClaimAmount4 = await stakingPool.connect(addr4).getUndistributedClaimAmount(addr4Address);

			// Verify all 3 users; addr2, addr3, and addr4 have correct expected reward quantities after latest mint to staking pool
			expect(addr2UndistributedClaimAmount4[2]).to.equal(BigInt(addr2TotalClaimAmount4));
			expect(addr3UndistributedClaimAmount4[2]).to.equal(BigInt(addr3TotalClaimAmount4));
			expect(addr4UndistributedClaimAmount4[2]).to.equal(BigInt(addr4TotalClaimAmount4));
		});

		it("Test reward breakdown with greatly varying degrees of staked esXai amounts", async function () {
			const {poolFactory, addr1, addr2, addr3, addr4, nodeLicense, esXai, esXaiMinter, referee, kycAdmin} = await loadFixture(deployInfrastructure);

			const ownerShare = 20_000; // 2 %
			const keyBucketShare = 843_750; // 84.375 %
			const esXaiBucketShare = 136_250; // 13.625 %

			// Mint key to make basic pool
			const addr1KeyQuantity = 1;
			const price = await nodeLicense.price(addr1KeyQuantity, "");
			await nodeLicense.connect(addr1).mint(addr1KeyQuantity, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId],
				[
					ownerShare,
					keyBucketShare,
					esXaiBucketShare,
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
			const addr4Address = await addr4.getAddress();
			const poolFactoryAddress = await poolFactory.getAddress();

			// Mint a key to addr2 & stake
			const addr2KeysToStake = 1;
			const price2 = await nodeLicense.price(addr2KeysToStake, "");
			await nodeLicense.connect(addr2).mint(addr2KeysToStake, "", {value: price2});
			const mintedKeyId2 = await nodeLicense.totalSupply();
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [mintedKeyId2]);

			// Mint & stake 10_000 esXai for addr2
			const addr2EsXaiToStake = 10_000;
			await esXai.connect(esXaiMinter).mint(addr2Address, addr2EsXaiToStake);
			await esXai.connect(addr2).increaseAllowance(poolFactoryAddress, addr2EsXaiToStake);
			await poolFactory.connect(addr2).stakeEsXai(stakingPoolAddress, addr2EsXaiToStake);

			// Mint a key to addr3 & stake
			const addr3KeysToStake = 1;
			const price3 = await nodeLicense.price(addr3KeysToStake, "");
			await nodeLicense.connect(addr3).mint(addr3KeysToStake, "", {value: price3});
			const mintedKeyId3 = await nodeLicense.totalSupply();
			await referee.connect(kycAdmin).addKycWallet(addr3Address);
			await poolFactory.connect(addr3).stakeKeys(stakingPoolAddress, [mintedKeyId3]);

			// Mint & stake 10_000_000 esXai for addr3
			const addr3EsXaiToStake = 10_000_000;
			await esXai.connect(esXaiMinter).mint(addr3Address, addr3EsXaiToStake);
			await esXai.connect(addr3).increaseAllowance(poolFactoryAddress, addr3EsXaiToStake);
			await poolFactory.connect(addr3).stakeEsXai(stakingPoolAddress, addr3EsXaiToStake);

			// Mint 100,000 esXai to the stakingPool
			const poolAmount = 100_000;
			await esXai.connect(esXaiMinter).mint(stakingPoolAddress, poolAmount);
			const stakingPoolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(stakingPoolBalance).to.equal(poolAmount);

			// Get current expected values
			const addr2UndistributedClaimAmount1 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);
			const addr3UndistributedClaimAmount1 = await stakingPool.connect(addr3).getUndistributedClaimAmount(addr3Address);
			expect(addr3UndistributedClaimAmount1[2]).to.be.greaterThan(addr2UndistributedClaimAmount1[2]);

			// Mint & stake enough esXai for addr2 to tie addr3 (this does claiming from the stake action)
			const addr2EsXaiToStake2 = addr3EsXaiToStake - addr2EsXaiToStake;
			await esXai.connect(esXaiMinter).mint(addr2Address, addr2EsXaiToStake2);
			await esXai.connect(addr2).increaseAllowance(poolFactoryAddress, addr2EsXaiToStake2);
			await poolFactory.connect(addr2).stakeEsXai(stakingPoolAddress, addr2EsXaiToStake2);

			// Mint 100,000 esXai to the stakingPool again
			const poolAmount2 = 100_000;
			await esXai.connect(esXaiMinter).mint(stakingPoolAddress, poolAmount2);
			const stakingPoolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			const poolOwnerClaimableRewards = await stakingPool.connect(addr1).poolOwnerClaimableRewards();
			expect(stakingPoolBalance2).to.equal(BigInt(poolAmount2) + poolOwnerClaimableRewards);

			// Get updated expected values that should now be equal
			const addr2UndistributedClaimAmount2 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);
			const addr3UndistributedClaimAmount2 = await stakingPool.connect(addr3).getUndistributedClaimAmount(addr3Address);
			expect(addr2UndistributedClaimAmount2[2]).to.equal(addr3UndistributedClaimAmount2[2]);
		});

		it("Verify outcome when not enough esXai in pool to distribute to holders", async function () {
			const {poolFactory, addr1, addr2, addr3, addr4, nodeLicense, esXai, esXaiMinter, referee, kycAdmin} = await loadFixture(deployInfrastructure);

			const ownerShare = 20_000; // 2 %
			const keyBucketShare = 843_750; // 84.375 %
			const esXaiBucketShare = 136_250; // 13.625 %

			// Mint key to make basic pool
			const addr1KeyQuantity = 1;
			const price = await nodeLicense.price(addr1KeyQuantity, "");
			await nodeLicense.connect(addr1).mint(addr1KeyQuantity, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId],
				[
					ownerShare,
					keyBucketShare,
					esXaiBucketShare,
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
			const addr4Address = await addr4.getAddress();
			const poolFactoryAddress = await poolFactory.getAddress();

			// Mint a key to addr2 & stake
			const addr2KeysToStake = 1;
			const price2 = await nodeLicense.price(addr2KeysToStake, "");
			await nodeLicense.connect(addr2).mint(addr2KeysToStake, "", {value: price2});
			const mintedKeyId2 = await nodeLicense.totalSupply();
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [mintedKeyId2]);

			// Mint & stake 10_000 esXai for addr2
			const addr2EsXaiToStake = 10_000;
			await esXai.connect(esXaiMinter).mint(addr2Address, addr2EsXaiToStake);
			await esXai.connect(addr2).increaseAllowance(poolFactoryAddress, addr2EsXaiToStake);
			await poolFactory.connect(addr2).stakeEsXai(stakingPoolAddress, addr2EsXaiToStake);

			// Mint a key to addr3 & stake
			const addr3KeysToStake = addr2KeysToStake;
			const price3 = await nodeLicense.price(addr3KeysToStake, "");
			await nodeLicense.connect(addr3).mint(addr3KeysToStake, "", {value: price3});
			const mintedKeyId3 = await nodeLicense.totalSupply();
			await referee.connect(kycAdmin).addKycWallet(addr3Address);
			await poolFactory.connect(addr3).stakeKeys(stakingPoolAddress, [mintedKeyId3]);

			// Mint & stake 10_000 esXai for addr3
			const addr3EsXaiToStake = addr2EsXaiToStake;
			await esXai.connect(esXaiMinter).mint(addr3Address, addr3EsXaiToStake);
			await esXai.connect(addr3).increaseAllowance(poolFactoryAddress, addr3EsXaiToStake);
			await poolFactory.connect(addr3).stakeEsXai(stakingPoolAddress, addr3EsXaiToStake);

			// Mint 1 esXai to the stakingPool
			const poolAmount = 1;
			await esXai.connect(esXaiMinter).mint(stakingPoolAddress, poolAmount);
			const stakingPoolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(stakingPoolBalance).to.equal(poolAmount);

			// Get current expected values
			const addr2UndistributedClaimAmount1 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);
			const addr3UndistributedClaimAmount1 = await stakingPool.connect(addr3).getUndistributedClaimAmount(addr3Address);
			expect(addr2UndistributedClaimAmount1[2]).to.equal(0);
			expect(addr2UndistributedClaimAmount1[2]).to.equal(addr3UndistributedClaimAmount1[2]);
		});
	}
}
