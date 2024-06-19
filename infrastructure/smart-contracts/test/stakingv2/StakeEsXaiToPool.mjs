import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {Contract} from "ethers";
import {StakingPoolAbi} from "@sentry/core";

export function StakeEsXaiToPool(deployInfrastructure, poolConfigurations) {
	const {
		validShareValues,
		poolMetaData,
		poolSocials,
		poolTrackerDetails,
		noDelegateOwner,
	} = poolConfigurations;

	return function () {
		it("Verify esXai balance of user decrease and balance of PoolFactory increases by amount", async function () {
			const {poolFactory, addr1, nodeLicense, esXai, esXaiMinter} = await loadFixture(deployInfrastructure);

			// Mint 10k esXai to addr1
			const addr1MintAddress = await addr1.getAddress();
			const mintAmount = 10_000;
			const stakeAmount = 1000;
			await esXai.connect(esXaiMinter).mint(addr1MintAddress, mintAmount);

			// Mint a node key & save the id
			const price = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			// Creat a pool
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

			// Check user initial balance before staking
			const userBalance1 = await esXai.connect(addr1).balanceOf(addr1MintAddress);
			expect(userBalance1).to.equal(mintAmount);

			// Increase the PoolFactory's allowance & stake some esXai
			await esXai.connect(addr1).increaseAllowance(await poolFactory.getAddress(), stakeAmount);
			await poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, stakeAmount);

			// Get the update balance of the user & the Referee & validate them
			const userBalance2 = await esXai.connect(addr1).balanceOf(addr1MintAddress);
			const poolFactoryBalance = await esXai.connect(addr1).balanceOf(await poolFactory.getAddress());
			expect(userBalance2).to.equal(mintAmount - stakeAmount);
			expect(poolFactoryBalance).to.equal(stakeAmount);
		});

		it("Verify the Pool Info for the staked user (should have userStakedEsXaiAmount, totalStakedAmount)", async function () {
			const {poolFactory, addr1, nodeLicense, esXai, esXaiMinter} = await loadFixture(deployInfrastructure);

			// Mint 10k esXai to addr1
			const addr1MintAddress = await addr1.getAddress();
			const mintAmount = 10_000;
			const stakeAmount = 1000;
			await esXai.connect(esXaiMinter).mint(addr1MintAddress, mintAmount);

			// Mint a node key & save the id
			const price = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			// Creat a pool
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

			// Increase the PoolFactory's allowance & stake some esXai
			await esXai.connect(addr1).increaseAllowance(await poolFactory.getAddress(), stakeAmount);
			await poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, stakeAmount);

			// Make sure the new pool has the correct information for staked esXai quantities
			const poolInfo = await stakingPool.connect(addr1).getPoolInfo();
			const userPoolData = await stakingPool.connect(addr1).getUserPoolData(await addr1.getAddress());
			expect(userPoolData.userStakedEsXaiAmount).to.equal(stakeAmount);
			expect(poolInfo[0].totalStakedAmount).to.equal(stakeAmount);
		});

		it("Cannot stake more than the max stake amount of the pool (calculated by staked keys * maxStakeAmountPerLicense)", async function () {
			const {
				poolFactory,
				addr1,
				nodeLicense,
				referee,
				esXai,
				esXaiMinter
			} = await loadFixture(deployInfrastructure);

			// Mint a node key & save the id
			const price = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			// Creat a pool
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

			// Determine maximum stake amount and attempt to stake more than that in single pool
			const maxStakeAmountPerLicense = await referee.connect(addr1).maxStakeAmountPerLicense();
			const poolStakedKeysCount = await stakingPool.connect(addr1).getStakedKeysCount();
			const maximum = maxStakeAmountPerLicense * poolStakedKeysCount;
			const mintAmount = maximum + 1n;
			await esXai.connect(esXaiMinter).mint(await addr1.getAddress(), mintAmount);
			await esXai.connect(addr1).increaseAllowance(await poolFactory.getAddress(), mintAmount);
			await expect(
				poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, mintAmount)
			).to.be.revertedWith("49");
		});

		it("Stake another key and check that more esXai can be staked", async function () {
			const {
				poolFactory,
				addr1,
				nodeLicense,
				referee,
				esXai,
				esXaiMinter
			} = await loadFixture(deployInfrastructure);

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

			// Create instance of the deployed pool
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// Determine maximum stake amount at current quantity of staked keys & successfully stake that amount
			const maxStakeAmountPerLicense = await referee.connect(addr1).maxStakeAmountPerLicense();
			const poolStakedKeysCount = await stakingPool.connect(addr1).getStakedKeysCount();
			const maximumWith1Key = maxStakeAmountPerLicense * poolStakedKeysCount;
			const mintAmount = maximumWith1Key * 2n;
			await esXai.connect(esXaiMinter).mint(await addr1.getAddress(), mintAmount);
			await esXai.connect(addr1).increaseAllowance(await poolFactory.getAddress(), mintAmount);
			await poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, maximumWith1Key);

			// Fail to stake additional esXai at current staked keys quantity
			await expect(
				poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, 1)
			).to.be.revertedWith("49");

			// Stake additional key & successfully stake more esXai
			await poolFactory.connect(addr1).stakeKeys(stakingPoolAddress, [mintedKeyId2]);
			await poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, maximumWith1Key);

			// Check the PoolFactory's balance after stake & confirm it is correct
			const poolFactoryBalance = await esXai.connect(addr1).balanceOf(await poolFactory.getAddress());
			expect(poolFactoryBalance).to.equal(mintAmount);
		});
	}
}
