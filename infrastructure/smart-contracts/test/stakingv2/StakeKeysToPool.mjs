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
	}
}
