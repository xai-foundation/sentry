import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {Contract} from "ethers";
import {StakingPoolAbi} from "@sentry/core";
import {expect} from "chai";

export function StakeKeysToPool(deployInfrastructure, poolConfigurations) {
	const {
		validShareValues,
		poolMetaData,
		poolSocials,
		poolTrackerDetails,
		noDelegateOwner,
	} = poolConfigurations;

	return function () {
		it("Verify the Pool Info for the staked user (should have keyCount, userStakedKeyIds)", async function () {
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
				noDelegateOwner,
				[mintedKeyId],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Save the new staking pool's address
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

			// Compare the pool of the assigned key to the just-created pool
			const assignedKeyPool = await referee.connect(addr1).assignedKeyToPool(mintedKeyId);
			expect(assignedKeyPool).to.equal(stakingPoolAddress);
		});

		it("Check that the key is assigned to the pool in the Referee for a user (assignedKeysOfUserCount)", async function () {
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
				noDelegateOwner,
				[mintedKeyId],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
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
					noDelegateOwner,
					[mintedKeyId1, mintedKeyId1],
					validShareValues,
					poolMetaData,
					poolSocials,
					poolTrackerDetails
				)
			).to.be.revertedWith("44");

			// Create a pool
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId1],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
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
				noDelegateOwner,
				[mintedKeyId1],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Fail to create another pool with the same key id
			await expect(
				poolFactory.connect(addr1).createPool(
					noDelegateOwner,
					[mintedKeyId1],
					validShareValues,
					poolMetaData,
					poolSocials,
					poolTrackerDetails
				)
			).to.be.revertedWith("44");

			// Create pool 2
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId2],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Save the new staking pool addresses
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
					noDelegateOwner,
					keys,
					validShareValues,
					poolMetaData,
					poolSocials,
					poolTrackerDetails
				)
			).to.be.revertedWith("43");
		});

		it("Pool owner can only un-stake the genesis key ", async function () {
			const {poolFactory, referee, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

			// Mint 2 node keys & save the ids
			const price = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId1 = await nodeLicense.totalSupply();
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId2 = await nodeLicense.totalSupply();

			// Creat a pool
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId1, mintedKeyId2],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Verify user has 2 keys staked
			const address = await addr1.getAddress();
			const balance1 = await referee.connect(addr1).assignedKeysOfUserCount(address);
			expect(balance1).to.equal(2);

			// Grab the address of the deployed pool
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

			// Fail to un-stake both keys
			await expect(
				poolFactory.connect(addr1).createUnstakeKeyRequest(stakingPoolAddress, 2)
			).to.be.revertedWith("15");

			// Fail to create genesis key un-stake request with 2 keys still staked
			await expect(
				poolFactory.connect(addr1).createUnstakeOwnerLastKeyRequest(stakingPoolAddress)
			).to.be.revertedWith("19");

			// Successfully create un-stake request for 1 key
			await poolFactory.connect(addr1).createUnstakeKeyRequest(stakingPoolAddress, 1);

			// Fail to un-stake last key with normal "createUnstakeKeyRequest" function
			await expect(
				poolFactory.connect(addr1).createUnstakeKeyRequest(stakingPoolAddress, 1)
			).to.be.revertedWith("15");

			// Successfully create un-stake request for genesis key
			await poolFactory.connect(addr1).createUnstakeOwnerLastKeyRequest(stakingPoolAddress);

			// Wait 60 days
			await ethers.provider.send("evm_increaseTime", [2592000 * 2]);
			await ethers.provider.send("evm_mine");

			// Successfully redeem both un-stake requests
			await poolFactory.connect(addr1).unstakeKeys(stakingPoolAddress, 0, [mintedKeyId1]);
			await poolFactory.connect(addr1).unstakeKeys(stakingPoolAddress, 1, [mintedKeyId2]);

			// Verify user has 0 keys staked
			const balance2 = await referee.connect(addr1).assignedKeysOfUserCount(address);
			expect(balance2).to.equal(0);
		});

		it("Verify that a user does not get duplicate pools in their interactedPoolsOfUser array", async function () {
			const {poolFactory, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

			// Mint 2 node keys & save the ids
			const price = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId1 = await nodeLicense.totalSupply();
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId2 = await nodeLicense.totalSupply();

			// Creat a pool
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId1],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Create reference of the deployed pool's address
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

			// Make sure the user only has 1 associated pool right now
			const address = await addr1.getAddress();
			const userPoolsCount1 = await poolFactory.connect(addr1).getPoolsOfUserCount(address);
			const userPoolsIndices1 = await poolFactory.connect(addr1).getPoolIndicesOfUser(address);
			const userPoolAddressOfUser1 = await poolFactory.connect(addr1).getPoolAddressOfUser(address, userPoolsCount1 - 1n);
			expect(userPoolsCount1).to.equal(1);
			expect(userPoolsIndices1[0]).to.equal(stakingPoolAddress);
			expect(userPoolAddressOfUser1).to.equal(stakingPoolAddress);

			// Successfully stake second key
			await poolFactory.connect(addr1).stakeKeys(stakingPoolAddress, [mintedKeyId2]);

			// Make sure the user still only has 1 associated pool
			const userPoolsCount2 = await poolFactory.connect(addr1).getPoolsOfUserCount(address);
			const userPoolsIndices2 = await poolFactory.connect(addr1).getPoolIndicesOfUser(address);
			const userPoolAddressOfUser2 = await poolFactory.connect(addr1).getPoolAddressOfUser(address, userPoolsCount1 - 1n);
			expect(userPoolsCount2).to.equal(1);
			expect(userPoolsIndices2[0]).to.equal(stakingPoolAddress);
			expect(userPoolAddressOfUser2).to.equal(stakingPoolAddress);
		});

		it("Create pool with multiple stakers, try to unstake all, then restake", async function () {
			const {poolFactory, addr1, addr2, addr3, nodeLicense, kycAdmin, referee} = await loadFixture(deployInfrastructure);

			// Mint 2 node keys & save the ids
			const price1 = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price1});
			const mintedKeyId1 = await nodeLicense.totalSupply();
			const price2 = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price2});
			const mintedKeyId2 = await nodeLicense.totalSupply();

			// Creat a pool
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId1],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Create reference of the deployed pool's address
			const stakingPoolAddress1 = await poolFactory.connect(addr1).getPoolAddress(0);

			// Creat a second pool
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId2],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Create reference of the deployed pool's address
			const stakingPoolAddress2 = await poolFactory.connect(addr1).getPoolAddress(1);

			// Mint 2 keys to addr2
			const price3 = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr2).mint(1, "", {value: price3});
			const mintedKeyId3 = await nodeLicense.totalSupply();
			const price4 = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr2).mint(1, "", {value: price4});
			const mintedKeyId4 = await nodeLicense.totalSupply();

			// Mint 2 keys to addr3
			const price5 = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr3).mint(1, "", {value: price5});
			const mintedKeyId5 = await nodeLicense.totalSupply();
			const price6 = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr3).mint(1, "", {value: price6});
			const mintedKeyId6 = await nodeLicense.totalSupply();

			// KYC addr3
			await referee.connect(kycAdmin).addKycWallet(await addr3.getAddress());

			// Both users stake a key into pool 1
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress1, [mintedKeyId3]);
			await poolFactory.connect(addr3).stakeKeys(stakingPoolAddress1, [mintedKeyId5]);

			// Verify both users have both pool 1 in their lists
			const user2Address = await addr2.getAddress();
			const user3Address = await addr3.getAddress();
			const addr2PoolCount1 = await poolFactory.connect(addr1).getPoolsOfUserCount(user2Address);
			const addr3PoolCount1 = await poolFactory.connect(addr1).getPoolsOfUserCount(user3Address);
			expect(addr2PoolCount1).to.equal(1);
			expect(addr3PoolCount1).to.equal(1);
			let addr2Pool1 = await poolFactory.connect(addr1).getPoolAddressOfUser(user2Address, 0);
			let addr3Pool1 = await poolFactory.connect(addr1).getPoolAddressOfUser(user3Address, 0);
			expect(addr2Pool1).to.equal(stakingPoolAddress1);
			expect(addr3Pool1).to.equal(stakingPoolAddress1);

			// Both users stake a key into pool 2
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress2, [mintedKeyId4]);
			await poolFactory.connect(addr3).stakeKeys(stakingPoolAddress2, [mintedKeyId6]);

			// Verify both users have both pool 2 in their lists
			const addr2PoolCount2 = await poolFactory.connect(addr1).getPoolsOfUserCount(user2Address);
			const addr3PoolCount2 = await poolFactory.connect(addr1).getPoolsOfUserCount(user3Address);
			expect(addr2PoolCount2).to.equal(2);
			expect(addr3PoolCount2).to.equal(2);
			let addr2Pool2 = await poolFactory.connect(addr1).getPoolAddressOfUser(user2Address, 1);
			let addr3Pool2 = await poolFactory.connect(addr1).getPoolAddressOfUser(user3Address, 1);
			expect(addr2Pool2).to.equal(stakingPoolAddress2);
			expect(addr3Pool2).to.equal(stakingPoolAddress2);

			// addr2 & addr3 un-stake from pool 1
			await poolFactory.connect(addr2).createUnstakeKeyRequest(stakingPoolAddress1, 1);
			await poolFactory.connect(addr3).createUnstakeKeyRequest(stakingPoolAddress1, 1);
			await ethers.provider.send("evm_increaseTime", [2592000]);
			await ethers.provider.send("evm_mine");
			await poolFactory.connect(addr2).unstakeKeys(stakingPoolAddress1, 0, [mintedKeyId3]);
			await poolFactory.connect(addr3).unstakeKeys(stakingPoolAddress1, 0, [mintedKeyId5]);

			// Verify both users now only have staking pool 2 in their lists
			const addr2PoolCount3 = await poolFactory.connect(addr1).getPoolsOfUserCount(user2Address);
			const addr3PoolCount3 = await poolFactory.connect(addr1).getPoolsOfUserCount(user3Address);
			expect(addr2PoolCount3).to.equal(1);
			expect(addr3PoolCount3).to.equal(1);
			addr2Pool1 = await poolFactory.connect(addr1).getPoolAddressOfUser(user2Address, 0);
			addr3Pool1 = await poolFactory.connect(addr1).getPoolAddressOfUser(user3Address, 0);
			expect(addr2Pool1).to.equal(stakingPoolAddress2);
			expect(addr3Pool1).to.equal(stakingPoolAddress2);

			// addr2 & addr3 un-stake from pool 2
			await poolFactory.connect(addr2).createUnstakeKeyRequest(stakingPoolAddress2, 1);
			await poolFactory.connect(addr3).createUnstakeKeyRequest(stakingPoolAddress2, 1);
			await ethers.provider.send("evm_increaseTime", [2592000]);
			await ethers.provider.send("evm_mine");
			await poolFactory.connect(addr2).unstakeKeys(stakingPoolAddress2, 0, [mintedKeyId4]);
			await poolFactory.connect(addr3).unstakeKeys(stakingPoolAddress2, 0, [mintedKeyId6]);

			// Verify both users now have no pools in their lists
			const addr2PoolCount4 = await poolFactory.connect(addr1).getPoolsOfUserCount(user2Address);
			const addr3PoolCount4 = await poolFactory.connect(addr1).getPoolsOfUserCount(user3Address);
			expect(addr2PoolCount4).to.equal(0);
			expect(addr3PoolCount4).to.equal(0);

			// Anticipate that trying to read pool "0" for both users fails with an out-of-bounds error
			let addr2Error;
			try {
				await poolFactory.connect(addr1).getPoolAddressOfUser(user2Address, 0);
			} catch (e) {
				addr2Error = e.toString();
			}
			let addr3Error;
			try {
				await poolFactory.connect(addr1).getPoolAddressOfUser(user3Address, 0);
			} catch (e) {
				addr3Error = e.toString();
			}
			expect(addr2Error).to.include("Array accessed at an out-of-bounds or negative index");
			expect(addr3Error).to.include("Array accessed at an out-of-bounds or negative index");
		});
	}
}
