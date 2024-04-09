import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {Contract} from "ethers";
import {StakingPoolAbi} from "@sentry/core";
import {expect} from "chai";

export function UpdatePool(deployInfrastructure, poolConfigurations) {
	const {
		validShareValues,
		poolName,
		poolDescription,
		poolLogo,
		poolMetaData,
		poolSocials,
		poolTrackerDetails,
		noDelegateOwner,
	} = poolConfigurations;

	return function () {
		it("Check that the Pool shares are updated", async function () {
			const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

			// Mint 2 node keys & save the ids
			const price1 = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price1});
			const mintedKeyId1 = await nodeLicense.totalSupply();
			const price2 = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price2});
			const mintedKeyId2 = await nodeLicense.totalSupply();

			// Create a pool
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId1],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Create instance of the deployed pool
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// Submit the updated share values
			const pendingOwnerShare = validShareValues[0] - 2n;
			const pendingKeyBucketShare = validShareValues[1] + 1n;
			const pendingEsXaiBucketShare = validShareValues[2] + 1n;
			await poolFactory.connect(addr1).updateShares(
				stakingPoolAddress,
				[
					pendingOwnerShare,
					pendingKeyBucketShare,
					pendingEsXaiBucketShare,
				]
			);

			
			// Check that the values did not update right away
			const currentOwnerShare = await stakingPool.connect(addr1).ownerShare();
			const currentKeyBucketShare = await stakingPool.connect(addr1).keyBucketShare();
			const currentEsXaiBucketShare = await stakingPool.connect(addr1).stakedBucketShare();
			expect(validShareValues[0]).to.equal(currentOwnerShare);
			expect(validShareValues[1]).to.equal(currentKeyBucketShare);
			expect(validShareValues[2]).to.equal(currentEsXaiBucketShare);
			
			
			// Wait for the delayPeriod
			const delayPeriod = await poolFactory.updateRewardBreakdownDelayPeriod();
			await ethers.provider.send("evm_increaseTime", [Number(delayPeriod)]);
			await ethers.provider.send("evm_mine");

			// Stake another key to the pool to proc the distributeRewards function, thus updating the share values
			await poolFactory.connect(addr1).stakeKeys(stakingPoolAddress, [mintedKeyId2]);

			// Get & check the updated share values
			const updatedOwnerShare = await stakingPool.connect(addr1).ownerShare();
			const updatedKeyBucketShare = await stakingPool.connect(addr1).keyBucketShare();
			const updatedEsXaiBucketShare = await stakingPool.connect(addr1).stakedBucketShare();
			expect(pendingOwnerShare).to.equal(updatedOwnerShare);
			expect(pendingKeyBucketShare).to.equal(updatedKeyBucketShare);
			expect(pendingEsXaiBucketShare).to.equal(updatedEsXaiBucketShare);
		});

		it("Check that the shares cannot go over the max values (bucketshareMaxValues = ordered owner, keys, esXaiStaker)", async function () {
			const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

			// Mint a node key & save the id
			const price = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			// Create a pool
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Create instance of the deployed pool
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

			// Anticipate failure of setting share values above the configured maximums
			// Owner share above maximum
			await expect(
				poolFactory.connect(addr1).updateShares(
					stakingPoolAddress,
					[
						validShareValues[0] + 1n,
						validShareValues[1],
						validShareValues[2]
					]
				)
			).to.be.revertedWith("7");

			// Key bucket share above maximum
			await expect(
				poolFactory.connect(addr1).updateShares(
					stakingPoolAddress,
					[
						validShareValues[0],
						validShareValues[1] + 1n,
						validShareValues[2]
					]
				)
			).to.be.revertedWith("7");

			// Staked esXai bucket share above maximum
			await expect(
				poolFactory.connect(addr1).updateShares(
					stakingPoolAddress,
					[
						validShareValues[0],
						validShareValues[1],
						validShareValues[2] + 1n
					]
				)
			).to.be.revertedWith("7");

			// All shares within valid limits but do not equal 10000
			await expect(
				poolFactory.connect(addr1).updateShares(
					stakingPoolAddress,
					[
						validShareValues[0] - 1n,
						validShareValues[1] - 1n,
						validShareValues[2] - 1n
					]
				)
			).to.be.revertedWith("7");
		});

		it("Check that the metadata gets returned from the poolInfo", async function () {
			const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

			// Mint a node key & save the id
			const price = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			// Create a pool
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Create instance of the deployed pool
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// Get & check the initial metadata
			const keyBucketAddress1 = await stakingPool.connect(addr1).keyBucket();
			const esXaiStakeBucketAddress1 = await stakingPool.connect(addr1).esXaiStakeBucket();
			const stakingPoolInfo1 = await stakingPool.connect(addr1).getPoolInfo();

			// PoolBaseInfo
			expect(stakingPoolInfo1[0].length).to.equal(10);
			expect(stakingPoolInfo1[0][0]).to.equal(stakingPoolAddress);
			expect(stakingPoolInfo1[0][1]).to.equal(await addr1.getAddress());
			expect(stakingPoolInfo1[0][2]).to.equal(keyBucketAddress1);
			expect(stakingPoolInfo1[0][3]).to.equal(esXaiStakeBucketAddress1);
			expect(stakingPoolInfo1[0][4]).to.equal(1);
			expect(stakingPoolInfo1[0][5]).to.equal(0);
			expect(stakingPoolInfo1[0][6]).to.equal(0);
			expect(stakingPoolInfo1[0][7]).to.equal(validShareValues[0]);
			expect(stakingPoolInfo1[0][8]).to.equal(validShareValues[1]);
			expect(stakingPoolInfo1[0][9]).to.equal(validShareValues[2]);

			// Rest of the metadata
			expect(stakingPoolInfo1[1]).to.equal(poolName);
			expect(stakingPoolInfo1[2]).to.equal(poolDescription);
			expect(stakingPoolInfo1[3]).to.equal(poolLogo);
			expect(stakingPoolInfo1[4].length).to.equal(3);
			expect(stakingPoolInfo1[4].length).to.equal(poolSocials.length);
			expect(stakingPoolInfo1[4][0]).to.equal(poolSocials[0]);
			expect(stakingPoolInfo1[4][1]).to.equal(poolSocials[1]);
			expect(stakingPoolInfo1[4][2]).to.equal(poolSocials[2]);
			expect(stakingPoolInfo1[5].length).to.equal(3);
			expect(stakingPoolInfo1[5][0]).to.equal(0n);
			expect(stakingPoolInfo1[5][1]).to.equal(0n);
			expect(stakingPoolInfo1[5][2]).to.equal(0n);

			// Update the metadata
			const updatedName = poolName + "2";
			const updatedDescription = poolDescription + "2";
			const updatedLogo = poolLogo + "2";
			const updatedSocials = poolSocials.map(social => social + "2");

			await poolFactory.connect(addr1).updatePoolMetadata(
				stakingPoolAddress,
				[
					updatedName,
					updatedDescription,
					updatedLogo,
				],
				updatedSocials,
			);

			// Get & check the updated metadata
			const keyBucketAddress2 = await stakingPool.connect(addr1).keyBucket();
			const esXaiStakeBucketAddress2 = await stakingPool.connect(addr1).esXaiStakeBucket();
			const stakingPoolInfo2 = await stakingPool.connect(addr1).getPoolInfo();

			// PoolBaseInfo
			expect(stakingPoolInfo2[0].length).to.equal(10);
			expect(stakingPoolInfo2[0][0]).to.equal(stakingPoolAddress);
			expect(stakingPoolInfo2[0][1]).to.equal(await addr1.getAddress());
			expect(stakingPoolInfo2[0][2]).to.equal(keyBucketAddress2);
			expect(stakingPoolInfo2[0][3]).to.equal(esXaiStakeBucketAddress2);
			expect(stakingPoolInfo2[0][4]).to.equal(1);
			expect(stakingPoolInfo2[0][5]).to.equal(0);
			expect(stakingPoolInfo2[0][6]).to.equal(0);
			expect(stakingPoolInfo2[0][7]).to.equal(validShareValues[0]);
			expect(stakingPoolInfo2[0][8]).to.equal(validShareValues[1]);
			expect(stakingPoolInfo2[0][9]).to.equal(validShareValues[2]);

			// Rest of the metadata
			expect(stakingPoolInfo2[1]).to.equal(updatedName);
			expect(stakingPoolInfo2[2]).to.equal(updatedDescription);
			expect(stakingPoolInfo2[3]).to.equal(updatedLogo);
			expect(stakingPoolInfo2[4].length).to.equal(3);
			expect(stakingPoolInfo2[4].length).to.equal(poolSocials.length);
			expect(stakingPoolInfo2[4][0]).to.equal(updatedSocials[0]);
			expect(stakingPoolInfo2[4][1]).to.equal(updatedSocials[1]);
			expect(stakingPoolInfo2[4][2]).to.equal(updatedSocials[2]);
			expect(stakingPoolInfo2[5].length).to.equal(3);
			expect(stakingPoolInfo2[5][0]).to.equal(0n);
			expect(stakingPoolInfo2[5][1]).to.equal(0n);
			expect(stakingPoolInfo2[5][2]).to.equal(0n);
		});
	}
}
