import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {Contract} from "ethers";
import {StakingPoolAbi} from "@sentry/core";

export function CreatePool(deployInfrastructure, poolConfigurations) {
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
		it("Must specify at least 1 key to create a pool with", async function () {
			const {poolFactory, addr1} = await loadFixture(deployInfrastructure);

			// Fail to create a pool
			await expect(
				poolFactory.connect(addr1).createPool(
					noDelegateOwner,
					[],
					validShareValues,
					poolMetaData,
					poolSocials,
					poolTrackerDetails
				)
			).to.be.revertedWith("2");
		});

		it("Check that the shares cannot go over the max values (bucketshareMaxValues = ordered owner, keys, esXaiStaker)", async function () {
			const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

			// Mint a node key & save the id
			const price = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			// Find the max values
			// Get the bucket share max values
			const bucketShareMaxValues0 = await poolFactory.connect(addr1).bucketshareMaxValues(0);
			const bucketShareMaxValues1 = await poolFactory.connect(addr1).bucketshareMaxValues(1);
			const bucketShareMaxValues2 = await poolFactory.connect(addr1).bucketshareMaxValues(2);
			const bucketshareMaxValues = [bucketShareMaxValues0, bucketShareMaxValues1, bucketShareMaxValues2];

			// Fail to create a pool
			await expect(
				poolFactory.connect(addr1).createPool(
					noDelegateOwner,
					[mintedKeyId],
					[
						bucketshareMaxValues[0] + 1n,
						bucketshareMaxValues[1] + 1n,
						bucketshareMaxValues[2] + 1n,
					],
					poolMetaData,
					poolSocials,
					poolTrackerDetails
				)
			).to.be.revertedWith("3");
		})

		it("Check that Pool exists (stakingPoolsCount, stakingPools[])", async function () {
			const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

			// Verify that there are no pools yet
			const stakingPoolsCount1 = await poolFactory.connect(addr1).getPoolsCount();
			expect(stakingPoolsCount1).to.equal(0);

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

			// Check that there is now 1 pool
			const stakingPoolsCount2 = await poolFactory.connect(addr1).getPoolsCount();
			expect(stakingPoolsCount2).to.equal(1);

			// Create instance of the deployed pool
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// Check the owner & name of the new pool are correct
			const stakingPoolOwner = await stakingPool.connect(addr1).getPoolOwner();
			const stakingPoolName = await stakingPool.connect(addr1).name();
			expect(stakingPoolOwner).to.equal(addr1.address);
			expect(stakingPoolName).to.equal(poolName);
		});

		it("Check that the Pool is created & the share values are correct", async function () {
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

			// Get & check the share values
			const ownerShare = await stakingPool.connect(addr1).ownerShare();
			const keyBucketShare = await stakingPool.connect(addr1).keyBucketShare();
			const stakedBucketShare = await stakingPool.connect(addr1).stakedBucketShare();

			expect(ownerShare).to.equal(validShareValues[0]);
			expect(keyBucketShare).to.equal(validShareValues[1]);
			expect(stakedBucketShare).to.equal(validShareValues[2]);
		});

		it("Check that it has 1 key assigned and the Pool Info returns the expected values", async function () {
			const {poolFactory, addr1, esXai, nodeLicense, referee} = await loadFixture(deployInfrastructure);

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

			// Verify the minted key is assigned to the first pool
			const assignedKeyPool = await referee.connect(addr1).assignedKeyToPool(mintedKeyId);
			const assignedKeyCount = await referee.connect(addr1).assignedKeysToPoolCount(stakingPoolAddress);
			expect(assignedKeyPool).to.equal(stakingPoolAddress);
			expect(assignedKeyCount).to.equal(1);

			// Verify that the Referee, esXai, and Pool owner are all correct
			const refereeAddress = await stakingPool.connect(addr1).refereeAddress();
			const esXaiAddress = await stakingPool.connect(addr1).esXaiAddress();
			const poolOwner = await stakingPool.connect(addr1).poolOwner();
			expect(refereeAddress).to.equal(await referee.getAddress());
			expect(esXaiAddress).to.equal(await esXai.getAddress());
			expect(poolOwner).to.equal(await addr1.getAddress());
		});

		it("Check that the metadata gets returned from the Pool info", async function () {
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

			// Get & check the metadata
			const keyBucketAddress = await stakingPool.connect(addr1).keyBucket();
			const esXaiStakeBucketAddress = await stakingPool.connect(addr1).esXaiStakeBucket();
			const stakingPoolInfo = await stakingPool.connect(addr1).getPoolInfo();

			// PoolBaseInfo
			expect(stakingPoolInfo[0].length).to.equal(10);
			expect(stakingPoolInfo[0][0]).to.equal(stakingPoolAddress);
			expect(stakingPoolInfo[0][1]).to.equal(await addr1.getAddress());
			expect(stakingPoolInfo[0][2]).to.equal(keyBucketAddress);
			expect(stakingPoolInfo[0][3]).to.equal(esXaiStakeBucketAddress);
			expect(stakingPoolInfo[0][4]).to.equal(1);
			expect(stakingPoolInfo[0][5]).to.equal(0);
			expect(stakingPoolInfo[0][6]).to.equal(0);
			expect(stakingPoolInfo[0][7]).to.equal(validShareValues[0]);
			expect(stakingPoolInfo[0][8]).to.equal(validShareValues[1]);
			expect(stakingPoolInfo[0][9]).to.equal(validShareValues[2]);

			// Rest of the metadata
			expect(stakingPoolInfo[1]).to.equal(poolName);
			expect(stakingPoolInfo[2]).to.equal(poolDescription);
			expect(stakingPoolInfo[3]).to.equal(poolLogo);
			expect(stakingPoolInfo[4].length).to.equal(3);
			expect(stakingPoolInfo[4].length).to.equal(poolSocials.length);
			expect(stakingPoolInfo[4][0]).to.equal(poolSocials[0]);
			expect(stakingPoolInfo[4][1]).to.equal(poolSocials[1]);
			expect(stakingPoolInfo[4][2]).to.equal(poolSocials[2]);
			expect(stakingPoolInfo[5].length).to.equal(3);
			expect(stakingPoolInfo[5][0]).to.equal(0n);
			expect(stakingPoolInfo[5][1]).to.equal(0n);
			expect(stakingPoolInfo[5][2]).to.equal(0n);
		});

		it("Verify that the owner can un-stake keys so long as they have more than 1 in the Pool", async function () {
			const {poolFactory, addr1, nodeLicense, referee} = await loadFixture(deployInfrastructure);

			// Mint 2 node keys & save the ids
			const price = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId1 = await nodeLicense.totalSupply();
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId2 = await nodeLicense.totalSupply();

			// Create a pool
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId1, mintedKeyId2],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Create reference of the deployed pool's address
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

			// Verify the minted keys are assigned to the correct pool
			const assignedKey1Pool1 = await referee.connect(addr1).assignedKeyToPool(mintedKeyId1);
			const assignedKey2Pool1 = await referee.connect(addr1).assignedKeyToPool(mintedKeyId2);
			const assignedKeyCount1 = await referee.connect(addr1).assignedKeysToPoolCount(stakingPoolAddress);
			expect(assignedKey1Pool1).to.equal(stakingPoolAddress);
			expect(assignedKey1Pool1).to.equal(assignedKey2Pool1);
			expect(assignedKeyCount1).to.equal(2);

			// Successfully un-stake 1 key (must wait 30 days)
			await poolFactory.connect(addr1).createUnstakeKeyRequest(stakingPoolAddress, 1);
			await ethers.provider.send("evm_increaseTime", [2592000 * 2]);
			await ethers.provider.send("evm_mine");
			await poolFactory.connect(addr1).unstakeKeys(stakingPoolAddress, 0, [mintedKeyId1]);

			// Verify the minted key is assigned to the first pool
			const assignedKey1Pool2 = await referee.connect(addr1).assignedKeyToPool(mintedKeyId1);
			const assignedKey2Pool2 = await referee.connect(addr1).assignedKeyToPool(mintedKeyId2);
			const assignedKeyCount2 = await referee.connect(addr1).assignedKeysToPoolCount(stakingPoolAddress);
			expect(assignedKey1Pool2).to.equal(ethers.ZeroAddress);
			expect(assignedKey2Pool2).to.equal(stakingPoolAddress);
			expect(assignedKeyCount2).to.equal(1);
		});

		it("Verify that the owner cannot un-stake all of their staked keys (there has to be at least 1 key of the pool owner staked into the Pool)", async function () {
			const {poolFactory, addr1, nodeLicense, referee} = await loadFixture(deployInfrastructure);

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

			// Create reference of the deployed pool's address
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

			// Verify the minted key is assigned to the correct pool
			const assignedKeyPool1 = await referee.connect(addr1).assignedKeyToPool(mintedKeyId);
			const assignedKeyCount1 = await referee.connect(addr1).assignedKeysToPoolCount(stakingPoolAddress);
			expect(assignedKeyPool1).to.equal(stakingPoolAddress);
			expect(assignedKeyCount1).to.equal(1);

			// Fail to create un-stake request for 1 key because can't go to 0
			await expect(
				poolFactory.connect(addr1).createUnstakeKeyRequest(stakingPoolAddress, 1)
			).to.be.revertedWith("15");

			// Verify the minted key is still assigned to the correct pool
			const assignedKeyPool2 = await referee.connect(addr1).assignedKeyToPool(mintedKeyId);
			const assignedKeyCount2 = await referee.connect(addr1).assignedKeysToPoolCount(stakingPoolAddress);
			expect(assignedKeyPool2).to.equal(stakingPoolAddress);
			expect(assignedKeyCount2).to.equal(1);
		});

		it("Verify that only the Referee has access control on the Pool", async function () {
			const {poolFactory, addr1, refereeDefaultAdmin} = await loadFixture(deployInfrastructure);

			const addr1Address = (await addr1.getAddress()).toLowerCase();
			const defaultAdminRole = await poolFactory.connect(addr1).DEFAULT_ADMIN_ROLE();
			const defaultAdminAccessControlError = `AccessControl: account ${addr1Address} is missing role ${defaultAdminRole}`;

			// Enable staking fail & success
			await expect(
				poolFactory.connect(addr1).enableStaking()
			).to.be.revertedWith(defaultAdminAccessControlError);
			await poolFactory.connect(refereeDefaultAdmin).enableStaking();

			// Update PoolProxyDeployer fail & success
			await expect(
				poolFactory.connect(addr1).updatePoolProxyDeployer(await addr1.getAddress())
			).to.be.revertedWith(defaultAdminAccessControlError);
			await poolFactory.connect(refereeDefaultAdmin).updatePoolProxyDeployer(await addr1.getAddress());
		});
	}
}
