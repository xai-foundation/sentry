import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {Contract} from "ethers";
import {StakingPoolAbi} from "@sentry/core";

export function StakingV2(deployInfrastructure) {
	return function () {
		let bucketshareMaxValues = [];
		const validShareValues = [500n, 8500n, 1000n];
		const poolName = "Testing Pool";
		const poolDescription = "This is for testing purposes only!!";
		const poolLogo = "Pool Logo";
		const poolSocials = ["Social 1", "Social 2", "Social 3"];
		const poolTrackerNames = ["Tracker Name 1", "Tracker Name 2", "Tracker Name 3"];
		const poolTrackerSymbols = ["Tracker Symbol 1", "Tracker Symbol 2", "Tracker Symbol 3"];

		beforeEach(async function () {
			const {poolFactory, addr1} = await loadFixture(deployInfrastructure);

			// Get the bucket share max values
			const bucketShareMaxValues0 = await poolFactory.connect(addr1).bucketshareMaxValues(0);
			const bucketShareMaxValues1 = await poolFactory.connect(addr1).bucketshareMaxValues(1);
			const bucketShareMaxValues2 = await poolFactory.connect(addr1).bucketshareMaxValues(2);
			bucketshareMaxValues = [bucketShareMaxValues0, bucketShareMaxValues1, bucketShareMaxValues2];
		});

		describe("Create Pool #187167264", function () {
			it("Must specify at least 1 key to create a pool with", async function () {
				const {poolFactory, addr1} = await loadFixture(deployInfrastructure);

				// Fail to create a pool
				await expect(
					poolFactory.connect(addr1).createPool(
						[],
						validShareValues[0],
						validShareValues[1],
						validShareValues[2],
						poolName,
						poolDescription,
						poolLogo,
						poolSocials,
						poolTrackerNames,
						poolTrackerSymbols
					)
				).to.be.revertedWith("Pool requires at least 1 key");
			});

			it("Check that the shares cannot go over the max values (bucketshareMaxValues = ordered owner, keys, esXaiStaker)", async function () {
				const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

				// Mint a node key & save the id
				const price = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price});
				const mintedKeyId = await nodeLicense.totalSupply();

				// Fail to create a pool
				await expect(
					poolFactory.connect(addr1).createPool(
						[mintedKeyId],
						bucketshareMaxValues[0] + 1n,
						bucketshareMaxValues[1] + 1n,
						bucketshareMaxValues[2] + 1n,
						poolName,
						poolDescription,
						poolLogo,
						poolSocials,
						poolTrackerNames,
						poolTrackerSymbols
					)
				).to.be.revertedWith("Invalid shares");
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
					[mintedKeyId],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
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
					[mintedKeyId],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
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
					[mintedKeyId],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
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
					[mintedKeyId],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
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
					[mintedKeyId1, mintedKeyId2],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
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
				await poolFactory.connect(addr1).unstakeKeys(0, [mintedKeyId1]);

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
					[mintedKeyId],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
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
				).to.be.revertedWith("Insufficient keys staked");

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

				// Update proxy admin fail & success
				await expect(
					poolFactory.connect(addr1).updateProxyAdmin(await poolFactory.getAddress())
				).to.be.revertedWith(defaultAdminAccessControlError);
				await poolFactory.connect(refereeDefaultAdmin).updateProxyAdmin(await poolFactory.getAddress());

				// Update pool implementation fail & success
				await expect(
					poolFactory.connect(addr1).updatePoolImplementation(await poolFactory.getAddress())
				).to.be.revertedWith(defaultAdminAccessControlError);
				await poolFactory.connect(refereeDefaultAdmin).updatePoolImplementation(await poolFactory.getAddress());

				// Update bucket implementation fail & success
				await expect(
					poolFactory.connect(addr1).updateBucketImplementation(await poolFactory.getAddress())
				).to.be.revertedWith(defaultAdminAccessControlError);
				await poolFactory.connect(refereeDefaultAdmin).updateBucketImplementation(await poolFactory.getAddress());
			});
		});

		describe("Update Pool #187167268", function () {
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
					[mintedKeyId1],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
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
					pendingOwnerShare,
					pendingKeyBucketShare,
					pendingEsXaiBucketShare,
				);

				// Wait 30 days
				await ethers.provider.send("evm_increaseTime", [2592000]);
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
					[mintedKeyId],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
				);

				// Create instance of the deployed pool
				const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

				// Anticipate failure of setting share values above the configured maximums
				// Owner share above maximum
				await expect(
					poolFactory.connect(addr1).updateShares(
						stakingPoolAddress,
						validShareValues[0] + 1n,
						validShareValues[1],
						validShareValues[2]
					)
				).to.be.revertedWith("Invalid shares");

				// Key bucket share above maximum
				await expect(
					poolFactory.connect(addr1).updateShares(
						stakingPoolAddress,
						validShareValues[0],
						validShareValues[1] + 1n,
						validShareValues[2]
					)
				).to.be.revertedWith("Invalid shares");

				// Staked esXai bucket share above maximum
				await expect(
					poolFactory.connect(addr1).updateShares(
						stakingPoolAddress,
						validShareValues[0],
						validShareValues[1],
						validShareValues[2] + 1n
					)
				).to.be.revertedWith("Invalid shares");

				// All shares within valid limits but do not equal 10000
				await expect(
					poolFactory.connect(addr1).updateShares(
						stakingPoolAddress,
						validShareValues[0] - 1n,
						validShareValues[1] - 1n,
						validShareValues[2] - 1n
					)
				).to.be.revertedWith("Invalid shares");
			});

			it("Check that the metadata gets returned from the poolInfo", async function () {
				const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

				// Mint a node key & save the id
				const price = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price});
				const mintedKeyId = await nodeLicense.totalSupply();

				// Create a pool
				await poolFactory.connect(addr1).createPool(
					[mintedKeyId],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
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
					updatedName,
					updatedDescription,
					updatedLogo,
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
		});

		describe("Stake Key to pool #187167267", function () {
			it("Verify the Pool Info for the staked user (should have keyCount, userStakedKeyIds)", async function () {
				const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

				// Mint a node key & save the id
				const price = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price});
				const mintedKeyId = await nodeLicense.totalSupply();

				// Create a pool
				await poolFactory.connect(addr1).createPool(
					[mintedKeyId],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
				);

				// Create reference of the deployed pool's address
				const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
				const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

				// Get the pool data & verify the key info matches
				const stakedKeysCountForUser = await stakingPool.connect(addr1).getStakedKeysCountForUser(await addr1.getAddress());
				const userPoolData = await stakingPool.connect(addr1).getUserPoolData(await addr1.getAddress());

				expect(stakedKeysCountForUser).to.equal(1);
				expect(userPoolData.userStakedKeyIds.length).to.equal(1);
				expect(userPoolData.userStakedKeyIds[0]).to.equal(mintedKeyId);
			});

			it("Check that the key is assigned to the pool in the Referee (assignedKeyToPool)", async function () {
				const {poolFactory, referee, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

				// Mint a node key & save the id
				const price = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price});
				const mintedKeyId = await nodeLicense.totalSupply();

				// Create a pool
				await poolFactory.connect(addr1).createPool(
					[mintedKeyId],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
				);

				// Save the new staking pool's address
				const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

				// Compare the pool of the assigned key to the just-created pool
				const assignedKeyPool = await referee.connect(addr1).assignedKeyToPool(mintedKeyId);
				expect(assignedKeyPool).to.equal(stakingPoolAddress);
			});

			it("Check that the key is assigned to the pool in the Referee (assignedKeyToPool)", async function () {
				const {poolFactory, referee, addr1, nodeLicense} = await loadFixture(deployInfrastructure);
				const address = await addr1.getAddress();

				// Check the user's initial assigned key count
				const keyCount1 = await referee.connect(addr1).assignedKeysOfUserCount(address);
				expect(keyCount1).to.equal(0);

				// Mint a node key & save the id
				const price = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price});
				const mintedKeyId = await nodeLicense.totalSupply();

				// Create a pool
				await poolFactory.connect(addr1).createPool(
					[mintedKeyId],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
				);

				// Check the user's updated assigned key count
				const keyCount2 = await referee.connect(addr1).assignedKeysOfUserCount(address);
				expect(keyCount2).to.equal(1);
			});

			it("Cannot stake the same key twice", async function () {
				const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

				// Mint 2 node keys & save the ids
				const price1 = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price1});
				const mintedKeyId1 = await nodeLicense.totalSupply();
				const price2 = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price2});
				const mintedKeyId2 = await nodeLicense.totalSupply();

				// Fail to create a pool
				await expect(
					poolFactory.connect(addr1).createPool(
						[mintedKeyId1, mintedKeyId1],
						validShareValues[0],
						validShareValues[1],
						validShareValues[2],
						poolName,
						poolDescription,
						poolLogo,
						poolSocials,
						poolTrackerNames,
						poolTrackerSymbols
					)
				).to.be.revertedWith("44");

				// Create a pool
				await poolFactory.connect(addr1).createPool(
					[mintedKeyId1],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
				);

				// Save the new staking pool's address
				const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

				// Fail to stake a key twice at the same time
				await expect(
					poolFactory.connect(addr1).stakeKeys(
						stakingPoolAddress,
						[mintedKeyId2, mintedKeyId2]
					)
				).to.be.revertedWith("44");
			});

			it("Cannot stake an already staked key", async function () {
				const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

				// Mint 2 node keys & save the ids
				const price1 = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price1});
				const mintedKeyId1 = await nodeLicense.totalSupply();
				const price2 = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price2});
				const mintedKeyId2 = await nodeLicense.totalSupply();

				// Create pool 1
				await poolFactory.connect(addr1).createPool(
					[mintedKeyId1],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
				);

				// Fail to create another pool with the same key id
				await expect(
					poolFactory.connect(addr1).createPool(
						[mintedKeyId1],
						validShareValues[0],
						validShareValues[1],
						validShareValues[2],
						poolName,
						poolDescription,
						poolLogo,
						poolSocials,
						poolTrackerNames,
						poolTrackerSymbols
					)
				).to.be.revertedWith("44");

				// Create pool 2
				await poolFactory.connect(addr1).createPool(
					[mintedKeyId2],
					validShareValues[0],
					validShareValues[1],
					validShareValues[2],
					poolName,
					poolDescription,
					poolLogo,
					poolSocials,
					poolTrackerNames,
					poolTrackerSymbols
				);

				// Save the new staking pool's address
				const stakingPoolAddress1 = await poolFactory.connect(addr1).getPoolAddress(0);
				const stakingPoolAddress2 = await poolFactory.connect(addr1).getPoolAddress(1);

				// Fail to stake key 1 in pool 1
				await expect(
					poolFactory.connect(addr1).stakeKeys(
						stakingPoolAddress1,
						[mintedKeyId1]
					)
				).to.be.revertedWith("44");

				// Fail to stake key 1 in pool 2
				await expect(
					poolFactory.connect(addr1).stakeKeys(
						stakingPoolAddress2,
						[mintedKeyId1]
					)
				).to.be.revertedWith("44");
			});

			it("Cannot stake more keys than maxKeysPerPool", async function () {
				const {poolFactory, referee, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

				// Mint a node key & save the id
				const price = await nodeLicense.price(1, "");
				await nodeLicense.connect(addr1).mint(1, "", {value: price});
				const mintedKeyId = await nodeLicense.totalSupply();

				// Make key id array with length 1 greater than the maximum allowed keys per pool
				const maxKeysPerPool = await referee.connect(addr1).maxKeysPerPool();
				const keys = new Array(Number(maxKeysPerPool) + 1).fill(mintedKeyId);

				// Fail to create a pool
				await expect(
					poolFactory.connect(addr1).createPool(
						keys,
						validShareValues[0],
						validShareValues[1],
						validShareValues[2],
						poolName,
						poolDescription,
						poolLogo,
						poolSocials,
						poolTrackerNames,
						poolTrackerSymbols
					)
				).to.be.revertedWith("43");
			});
		});

		describe("Stake esXai to pool #187167334", function () {
			it("Verify esXai balance of user decrease and balance of Referee increases by amount", async function () {
				const {poolFactory, referee, addr1, nodeLicense, esXai, esXaiMinter} = await loadFixture(deployInfrastructure);

				await esXai.connect(esXaiMinter).mint(await addr1.getAddress(), 10_000);
			});

			it("Verify the Pool Info for the staked user (should have userStakedEsXaiAmount, totalStakedAmount)", async function () {

			});

			it("Cannot stake more than the max stake amount of the pool (calculated by staked keys * maxStakeAmountPerLicense)", async function () {

			});

			it("Stake another key and check that more esXai can be staked", async function () {

			});
		});
	}
}
