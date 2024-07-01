import {expect, assert} from "chai";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {Contract} from "ethers";
import {StakingPoolAbi} from "@sentry/core";

export function UnStakingPeriods(deployInfrastructure, poolConfigurations) {
	const {
		validShareValues,
		poolMetaData,
		poolSocials,
		poolTrackerDetails,
		noDelegateOwner,
	} = poolConfigurations;

	return function () {
		it("Should be able to update the normal key un-stake period without affecting current un-stake requests", async function () {
			const {poolFactory, addr1, addr2, nodeLicense, referee, refereeDefaultAdmin} = await loadFixture(deployInfrastructure);

			// Mint a 2 node keys & save the ids
			const price1 = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price1});
			const mintedKeyId1 = await nodeLicense.totalSupply();
			const price2 = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr2).mint(1, "", {value: price2});
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

			// Save the pool factory's address
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// addr2 stakes a key & begins un-stake request
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [mintedKeyId2]);
			await poolFactory.connect(addr2).createUnstakeKeyRequest(stakingPoolAddress, 1);

			// Get the current un-stake periods
			const unstakeKeysDelayPeriod1 = await poolFactory.connect(addr1).unstakeKeysDelayPeriod();
			const unstakeGenesisKeyDelayPeriod1 = await poolFactory.connect(addr1).unstakeGenesisKeyDelayPeriod();
			const unstakeEsXaiDelayPeriod1 = await poolFactory.connect(addr1).unstakeEsXaiDelayPeriod();
			const updateRewardsDelayPeriod1 = await poolFactory.connect(addr1).updateRewardBreakdownDelayPeriod();

			// admin updates un-stake keys period
			const newUnStakeKeysDelay = unstakeKeysDelayPeriod1 * 2n;
			await poolFactory.connect(refereeDefaultAdmin).updateDelayPeriods(
				newUnStakeKeysDelay,
				unstakeGenesisKeyDelayPeriod1,
				unstakeEsXaiDelayPeriod1,
				updateRewardsDelayPeriod1
			);

			// Get the updated delay periods & make sure they are all correct
			const unstakeKeysDelayPeriod2 = await poolFactory.connect(addr1).unstakeKeysDelayPeriod();
			const unstakeGenesisKeyDelayPeriod2 = await poolFactory.connect(addr1).unstakeGenesisKeyDelayPeriod();
			const unstakeEsXaiDelayPeriod2 = await poolFactory.connect(addr1).unstakeEsXaiDelayPeriod();
			expect(unstakeKeysDelayPeriod2).to.equal(newUnStakeKeysDelay);
			expect(unstakeGenesisKeyDelayPeriod2).to.equal(unstakeGenesisKeyDelayPeriod1);
			expect(unstakeEsXaiDelayPeriod2).to.equal(unstakeEsXaiDelayPeriod1);

			// Wait (unstakeKeysDelayPeriod1) days
			const initialWaitTimeInSeconds = Number(unstakeKeysDelayPeriod1);
			await ethers.provider.send("evm_increaseTime", [initialWaitTimeInSeconds]);
			await ethers.provider.send("evm_mine");

			// successfully un-stake addr2 key after only waiting the initial delay period
			await poolFactory.connect(addr2).unstakeKeys(stakingPoolAddress, 0, [mintedKeyId2]);

			// addr2 stakes a key & begins un-stake request again
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [mintedKeyId2]);
			await poolFactory.connect(addr2).createUnstakeKeyRequest(stakingPoolAddress, 1);

			// Wait (unstakeKeysDelayPeriod1) days
			await ethers.provider.send("evm_increaseTime", [initialWaitTimeInSeconds]);
			await ethers.provider.send("evm_mine");

			// Fail to un-stake after only waiting the initial delay period
			await expect(
				poolFactory.connect(addr2).unstakeKeys(stakingPoolAddress, 1, [mintedKeyId2])
			).to.be.revertedWith("25");

			// Wait remainder time
			const updatedWaitTimeInSeconds = Number(unstakeKeysDelayPeriod2);
			const remainderWaitTime = updatedWaitTimeInSeconds - initialWaitTimeInSeconds;
			await ethers.provider.send("evm_increaseTime", [remainderWaitTime]);
			await ethers.provider.send("evm_mine");

			// Successfully un-stake addr2 key after only waiting the remainder time
			await poolFactory.connect(addr2).unstakeKeys(stakingPoolAddress, 1, [mintedKeyId2]);

			// Confirm addr2 has no staked keys
			const addr2Address = await addr2.getAddress();
			const stakedQuantityInReferee = await referee.connect(addr1).assignedKeysOfUserCount(addr2Address);
			const stakedQuantityInPool = await stakingPool.connect(addr1).getStakedKeysCountForUser(addr2Address);
			expect(stakedQuantityInReferee).to.equal(0);
			expect(stakedQuantityInPool).to.equal(0);
		});

		it("Should be able to update the genesis key un-stake period without affecting current un-stake requests", async function () {
			const {poolFactory, addr1, nodeLicense, referee, refereeDefaultAdmin} = await loadFixture(deployInfrastructure);

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

			// Save the pool factory's address
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// addr1 begins un-stake request
			await poolFactory.connect(addr1).createUnstakeOwnerLastKeyRequest(stakingPoolAddress);

			// Get the current un-stake periods
			const unstakeKeysDelayPeriod1 = await poolFactory.connect(addr1).unstakeKeysDelayPeriod();
			const unstakeGenesisKeyDelayPeriod1 = await poolFactory.connect(addr1).unstakeGenesisKeyDelayPeriod();
			const unstakeEsXaiDelayPeriod1 = await poolFactory.connect(addr1).unstakeEsXaiDelayPeriod();
			const updateRewardsDelayPeriod1 = await poolFactory.connect(addr1).updateRewardBreakdownDelayPeriod();

			// admin updates un-stake keys period
			const newUnStakeGenesisKeyDelay = unstakeGenesisKeyDelayPeriod1 * 2n;
			await poolFactory.connect(refereeDefaultAdmin).updateDelayPeriods(
				unstakeKeysDelayPeriod1,
				newUnStakeGenesisKeyDelay,
				unstakeEsXaiDelayPeriod1,
				updateRewardsDelayPeriod1
			);

			// Get the updated delay periods & make sure they are all correct
			const unstakeKeysDelayPeriod2 = await poolFactory.connect(addr1).unstakeKeysDelayPeriod();
			const unstakeGenesisKeyDelayPeriod2 = await poolFactory.connect(addr1).unstakeGenesisKeyDelayPeriod();
			const unstakeEsXaiDelayPeriod2 = await poolFactory.connect(addr1).unstakeEsXaiDelayPeriod();
			expect(unstakeKeysDelayPeriod2).to.equal(unstakeKeysDelayPeriod1);
			expect(unstakeGenesisKeyDelayPeriod2).to.equal(newUnStakeGenesisKeyDelay);
			expect(unstakeEsXaiDelayPeriod2).to.equal(unstakeEsXaiDelayPeriod1);

			// Wait (unstakeGenesisKeyDelayPeriod1) days
			const initialWaitTimeInSeconds = Number(unstakeGenesisKeyDelayPeriod1);
			await ethers.provider.send("evm_increaseTime", [initialWaitTimeInSeconds]);
			await ethers.provider.send("evm_mine");

			// successfully un-stake genesis key after only waiting the initial delay period
			await poolFactory.connect(addr1).unstakeKeys(stakingPoolAddress, 0, [mintedKeyId]);

			// addr1 stakes a key & begins un-stake request again
			await poolFactory.connect(addr1).stakeKeys(stakingPoolAddress, [mintedKeyId]);
			await poolFactory.connect(addr1).createUnstakeOwnerLastKeyRequest(stakingPoolAddress);

			// Wait (unstakeGenesisKeyDelayPeriod1) days
			await ethers.provider.send("evm_increaseTime", [initialWaitTimeInSeconds]);
			await ethers.provider.send("evm_mine");

			// Fail to un-stake after only waiting the initial delay period
			await expect(
				poolFactory.connect(addr1).unstakeKeys(stakingPoolAddress, 1, [mintedKeyId])
			).to.be.revertedWith("25");

			// Wait remainder time
			const updatedWaitTimeInSeconds = Number(unstakeGenesisKeyDelayPeriod2);
			const remainderWaitTime = updatedWaitTimeInSeconds - initialWaitTimeInSeconds;
			await ethers.provider.send("evm_increaseTime", [remainderWaitTime]);
			await ethers.provider.send("evm_mine");

			// Successfully un-stake addr2 key after only waiting the remainder time
			await poolFactory.connect(addr1).unstakeKeys(stakingPoolAddress, 1, [mintedKeyId]);

			// Confirm addr2 has no staked keys
			const addr1Address = await addr1.getAddress();
			const stakedQuantityInReferee = await referee.connect(addr1).assignedKeysOfUserCount(addr1Address);
			const stakedQuantityInPool = await stakingPool.connect(addr1).getStakedKeysCountForUser(addr1Address);
			expect(stakedQuantityInReferee).to.equal(0);
			expect(stakedQuantityInPool).to.equal(0);
		});

		it("Should be able to update the esXai un-stake period without affecting current un-stake requests", async function () {
			const {poolFactory, addr1, nodeLicense, esXai, esXaiMinter, refereeDefaultAdmin} = await loadFixture(deployInfrastructure);

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

			// Save the pool factory's address
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// Mint some esXai to addr1 & stake & begin un-stake request
			const mintAmount = 10_000;
			await esXai.connect(esXaiMinter).mint(await addr1.getAddress(), mintAmount);
			await esXai.connect(addr1).increaseAllowance(await poolFactory.getAddress(), mintAmount);
			await poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, mintAmount);
			await poolFactory.connect(addr1).createUnstakeEsXaiRequest(stakingPoolAddress, mintAmount);

			// Get the current un-stake periods
			const unstakeKeysDelayPeriod1 = await poolFactory.connect(addr1).unstakeKeysDelayPeriod();
			const unstakeGenesisKeyDelayPeriod1 = await poolFactory.connect(addr1).unstakeGenesisKeyDelayPeriod();
			const unstakeEsXaiDelayPeriod1 = await poolFactory.connect(addr1).unstakeEsXaiDelayPeriod();
			const updateRewardsDelayPeriod1 = await poolFactory.connect(addr1).updateRewardBreakdownDelayPeriod();

			// admin updates un-stake keys period
			const newUnStakeEsXaiDelay = unstakeEsXaiDelayPeriod1 * 2n;
			await poolFactory.connect(refereeDefaultAdmin).updateDelayPeriods(
				unstakeKeysDelayPeriod1,
				unstakeGenesisKeyDelayPeriod1,
				newUnStakeEsXaiDelay,
				updateRewardsDelayPeriod1
			);

			// Get the updated delay periods & make sure they are all correct
			const unstakeKeysDelayPeriod2 = await poolFactory.connect(addr1).unstakeKeysDelayPeriod();
			const unstakeGenesisKeyDelayPeriod2 = await poolFactory.connect(addr1).unstakeGenesisKeyDelayPeriod();
			const unstakeEsXaiDelayPeriod2 = await poolFactory.connect(addr1).unstakeEsXaiDelayPeriod();
			expect(unstakeKeysDelayPeriod2).to.equal(unstakeKeysDelayPeriod1);
			expect(unstakeGenesisKeyDelayPeriod2).to.equal(unstakeGenesisKeyDelayPeriod1);
			expect(unstakeEsXaiDelayPeriod2).to.equal(newUnStakeEsXaiDelay);

			// Wait (unstakeEsXaiDelayPeriod1) days
			const initialWaitTimeInSeconds = Number(unstakeEsXaiDelayPeriod1);
			await ethers.provider.send("evm_increaseTime", [initialWaitTimeInSeconds]);
			await ethers.provider.send("evm_mine");

			// successfully un-stake esXai after only waiting the initial delay period
			await poolFactory.connect(addr1).unstakeEsXai(stakingPoolAddress, 0, mintAmount);

			// addr1 stakes esXai & begins un-stake request again
			await esXai.connect(addr1).increaseAllowance(await poolFactory.getAddress(), mintAmount);
			await poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, mintAmount);
			await poolFactory.connect(addr1).createUnstakeEsXaiRequest(stakingPoolAddress, mintAmount);

			// Wait (unstakeEsXaiDelayPeriod1) days
			await ethers.provider.send("evm_increaseTime", [initialWaitTimeInSeconds]);
			await ethers.provider.send("evm_mine");

			// Fail to un-stake after only waiting the initial delay period
			await expect(
				poolFactory.connect(addr1).unstakeEsXai(stakingPoolAddress, 1, mintAmount)
			).to.be.revertedWith("30");

			// Wait remainder time
			const updatedWaitTimeInSeconds = Number(unstakeEsXaiDelayPeriod2);
			const remainderWaitTime = updatedWaitTimeInSeconds - initialWaitTimeInSeconds;
			await ethers.provider.send("evm_increaseTime", [remainderWaitTime]);
			await ethers.provider.send("evm_mine");

			// Successfully un-stake addr2 esXai after only waiting the remainder time
			await poolFactory.connect(addr1).unstakeEsXai(stakingPoolAddress, 1, mintAmount)

			// Confirm addr2 has no esXai staked
			const addr1Address = await addr1.getAddress();
			const balance = await esXai.connect(addr1).balanceOf(addr1Address);
			const stakedAmount = await stakingPool.connect(addr1).stakedAmounts(addr1Address);
			expect(balance).to.equal(mintAmount);
			expect(stakedAmount).to.equal(0);
		});

		it("Pool Info should return info about the pool owner's key un-stake info", async function () {
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

			// Save the pool factory's address
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// Check the pool info first make sure it checks out
			const poolInfo1 = await stakingPool.connect(addr1).getPoolInfo();
			expect(poolInfo1._ownerStakedKeys).to.equal(1);
			expect(poolInfo1._ownerRequestedUnstakeKeyAmount).to.equal(0);
			expect(poolInfo1._ownerLatestUnstakeRequestLockTime).to.equal(0);

			// Calculate the minimum time that the lock period will be on the upcoming request
			const lastKeyDelayPeriod = await poolFactory.connect(addr1).unstakeGenesisKeyDelayPeriod();
            const startTime = await ethers.provider.getBlock('latest').then(block => block.timestamp);
			// const nowInSeconds = Math.floor(Date.now() / 1000);
			const minimumLockTime = lastKeyDelayPeriod + BigInt(startTime);

			// Create the un-stake request and check the updated pool info
			await poolFactory.connect(addr1).createUnstakeOwnerLastKeyRequest(stakingPoolAddress);
			const poolInfo2 = await stakingPool.connect(addr1).getPoolInfo();
			expect(poolInfo2._ownerStakedKeys).to.equal(1);
			expect(poolInfo2._ownerRequestedUnstakeKeyAmount).to.equal(1);
			expect(poolInfo2._ownerLatestUnstakeRequestLockTime).to.be.greaterThan(0);
			expect(poolInfo2._ownerLatestUnstakeRequestLockTime).to.be.greaterThanOrEqual(minimumLockTime);

			// Wait long enough to be able to complete the un-stake request
			await ethers.provider.send("evm_increaseTime", [Number(lastKeyDelayPeriod)]);
			await ethers.provider.send("evm_mine");

			// Finish the un-stake request & check final pool info
			await poolFactory.connect(addr1).unstakeKeys(stakingPoolAddress, 0, [mintedKeyId]);
			const poolInfo3 = await stakingPool.connect(addr1).getPoolInfo();
			expect(poolInfo3._ownerStakedKeys).to.equal(0);
			expect(poolInfo3._ownerLatestUnstakeRequestLockTime).to.equal(0);
		});
	}
}
