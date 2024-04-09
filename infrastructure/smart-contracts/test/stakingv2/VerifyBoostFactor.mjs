import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { assert, expect } from "chai";
import { findHighestStakeTier } from "../StakingV2.mjs";
import { getStateRoots } from "../Referee.mjs";

const mitBatchedLicenses = async (amount, nodeLicenseContract) => {

	let amountLeft = amount;
	while (amountLeft != 0) {

		if (amountLeft > 50) {
			const price = await nodeLicenseContract.price(50, "");
			await nodeLicenseContract.mint(50, "", { value: price });
			amountLeft -= 50n;
		} else {
			const price = await nodeLicenseContract.price(amountLeft, "");
			await nodeLicenseContract.mint(amountLeft, "", { value: price });
			amountLeft = 0n;
		}

	}
}

export function VerifyBoostFactor(deployInfrastructure, poolConfigurations) {
	const {
		validShareValues,
		poolMetaData,
		poolSocials,
		poolTrackerDetails,
		noDelegateOwner,
	} = poolConfigurations;

	return function () {
		it("Verify pool increases boost factor with increasing staked esXai", async function () {
			const {
				poolFactory,
				addr1,
				nodeLicense,
				referee,
				refereeDefaultAdmin,
				esXai,
				esXaiMinter
			} = await loadFixture(deployInfrastructure);

			// Mint key to make basic pool
			const price = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", { value: price });
			const mintedKeyId = await nodeLicense.totalSupply();

			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Save the new pool's address
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

			// Expect this pool with no esXai to be in the "not a tier" tier (hardcoded return value in Referee5's _getBoostFactor)
			const poolBoostFactor1 = await referee.connect(refereeDefaultAdmin).getBoostFactorForStaker(stakingPoolAddress);
			expect(poolBoostFactor1).to.equal(100);

			// Find min esXai threshold (tier 1); mint, grant allowance, and stake
			const minEsXaiThreshold = await referee.connect(refereeDefaultAdmin).stakeAmountTierThresholds(0);
			await esXai.connect(esXaiMinter).mint(await addr1.getAddress(), minEsXaiThreshold);
			await esXai.connect(addr1).increaseAllowance(await poolFactory.getAddress(), minEsXaiThreshold);
			await poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, minEsXaiThreshold);

			// Expect this pool to now be in tier 1 (index 0)
			const minBoostFactor = await referee.connect(refereeDefaultAdmin).stakeAmountBoostFactors(0);
			const poolBoostFactor2 = await referee.connect(refereeDefaultAdmin).getBoostFactorForStaker(stakingPoolAddress);
			expect(poolBoostFactor2).to.equal(minBoostFactor);
		});

		it("Verify that a pool with enough esXai is in a higher tier", async function () {
			const {
				poolFactory,
				addr1,
				nodeLicense,
				referee,
				refereeDefaultAdmin,
				esXai,
				esXaiMinter
			} = await loadFixture(deployInfrastructure);

			// Manually find the highest stake tier thresholds as we have no way to check the array lengths (no functions to get length, and public array's cannot be length-queried)
			const [highestFoundStakeAmountTierThreshold, highestFoundTier] = await findHighestStakeTier(referee, refereeDefaultAdmin);

			// Determine how many keys we will need to reach the highest esXai stake allowance tier
			const maxStakeAmountPerLicense = await referee.connect(refereeDefaultAdmin).maxStakeAmountPerLicense();
			const keysForHighestTier = highestFoundStakeAmountTierThreshold / maxStakeAmountPerLicense;
			const startingSupply = await nodeLicense.totalSupply();
			await mitBatchedLicenses(keysForHighestTier, nodeLicense.connect(addr1));
			// const price = await nodeLicense.price(keysForHighestTier, "");
			// await nodeLicense.connect(addr1).mint(keysForHighestTier, "", { value: price });
			const endingSupply = await nodeLicense.totalSupply();

			// Save the key ids we minted to an array for pool creation
			const keyIds = [];
			for (let i = startingSupply; i < endingSupply; i++) {
				keyIds.push(i + 1n);
			}

			// Creat a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
			if (keyIds.length > 200) {

				await poolFactory.connect(addr1).createPool(
					noDelegateOwner,
					keyIds.splice(0, 100),
					validShareValues,
					poolMetaData,
					poolSocials,
					poolTrackerDetails
				);
				const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

				while (keyIds.length > 0) {
					await poolFactory.connect(addr1).stakeKeys(stakingPoolAddress, keyIds.splice(0, 100))
				}

			} else {
				await poolFactory.connect(addr1).createPool(
					noDelegateOwner,
					keyIds,
					validShareValues,
					poolMetaData,
					poolSocials,
					poolTrackerDetails
				);
			}


			// Save the new pool's address
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

			// Mint the required esXai to addr1, add the allowance to the pool factory, and then stake that amount
			await esXai.connect(esXaiMinter).mint(await addr1.getAddress(), highestFoundStakeAmountTierThreshold);
			await esXai.connect(addr1).increaseAllowance(await poolFactory.getAddress(), highestFoundStakeAmountTierThreshold);
			await poolFactory.connect(addr1).stakeEsXai(stakingPoolAddress, highestFoundStakeAmountTierThreshold);

			// Check the expected boost factor at the $highestFoundTier & compare it to the pool's
			const maxBoostFactor = await referee.connect(refereeDefaultAdmin).stakeAmountBoostFactors(highestFoundTier);
			const poolBoostFactor2 = await referee.connect(refereeDefaultAdmin).getBoostFactorForStaker(stakingPoolAddress);
			expect(poolBoostFactor2).to.equal(maxBoostFactor);
		});

		it("Verify that keys in a pool with esXai staked wins more challenges", async function () {
			const { poolFactory, addr1, addr2, nodeLicense, referee, refereeDefaultAdmin, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

			// Get a single key for addr1
			const singlePrice = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", { value: singlePrice });
			const addr1MintedKeyId = await nodeLicense.totalSupply();

			// Manually find the highest stake tier thresholds as we have no way to check the array lengths (no functions to get length, and public array's cannot be length-queried)
			const [highestFoundStakeAmountTierThreshold, highestFoundTier] = await findHighestStakeTier(referee, refereeDefaultAdmin);

			// Determine how many keys we will need to reach the highest esXai stake allowance tier
			const maxStakeAmountPerLicense = await referee.connect(refereeDefaultAdmin).maxStakeAmountPerLicense();
			const keysForHighestTier = highestFoundStakeAmountTierThreshold / maxStakeAmountPerLicense;
			const startingSupply = await nodeLicense.totalSupply();
			await mitBatchedLicenses(keysForHighestTier, nodeLicense.connect(addr2));
			// const price = await nodeLicense.price(keysForHighestTier, "");
			// await nodeLicense.connect(addr2).mint(keysForHighestTier, "", { value: price });
			const endingSupply = await nodeLicense.totalSupply();

			// Save the key ids we minted to an array for pool creation
			const keyIds = [];
			for (let i = startingSupply; i < endingSupply; i++) {
				keyIds.push(i + 1n);
			}

			// Creat a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
			if (keyIds.length > 100) {

				const _keyIds = [...keyIds];

				await poolFactory.connect(addr2).createPool(
					noDelegateOwner,
					_keyIds.splice(0, 100),
					validShareValues,
					poolMetaData,
					poolSocials,
					poolTrackerDetails
				);
				const stakingPoolAddress = await poolFactory.connect(addr2).getPoolAddress(0);
				while (_keyIds.length > 0) {
					await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, _keyIds.splice(0, 100))
				}

			} else {
				await poolFactory.connect(addr2).createPool(
					noDelegateOwner,
					keyIds,
					validShareValues,
					poolMetaData,
					poolSocials,
					poolTrackerDetails
				);
			}

			// Save the new pool's address
			const stakingPoolAddress = await poolFactory.connect(addr2).getPoolAddress(0);

			// Mint the required esXai to addr2, add the allowance to the pool factory, and then stake that amount
			await esXai.connect(esXaiMinter).mint(await addr2.getAddress(), highestFoundStakeAmountTierThreshold);
			await esXai.connect(addr2).increaseAllowance(await poolFactory.getAddress(), highestFoundStakeAmountTierThreshold);
			await poolFactory.connect(addr2).stakeEsXai(stakingPoolAddress, highestFoundStakeAmountTierThreshold);

			// Prepare for the submissions loop
			const numSubmissions = 1000;
			const stateRoots = await getStateRoots(numSubmissions * 2);

			let numSoloKeyPayouts = 0;
			let numBoostedPoolPayouts = 0;

			for (let i = 0; i < numSubmissions; i++) {
				const stateRoot = stateRoots[i];

				// Submit a challenge
				await referee.connect(challenger).submitChallenge(
					i + 1,
					i,
					stateRoot,
					0,
					"0x0000000000000000000000000000000000000000000000000000000000000000"
				);

				// Check to see the challenge is open for submissions
				const { openForSubmissions } = await referee.getChallenge(i);
				expect(openForSubmissions).to.be.eq(true);

				// Submit assertions
				await referee.connect(addr1).submitAssertionToChallenge(addr1MintedKeyId, i, stateRoot);
				await referee.connect(addr2).submitAssertionToChallenge(keyIds[0], i, stateRoot);

				// Check submissions, count payouts
				const submission1 = await referee.getSubmissionsForChallenges([i], addr1MintedKeyId);
				assert.equal(submission1[0].submitted, true, "The submission was not submitted");
				if (submission1[0].eligibleForPayout) {
					numSoloKeyPayouts++;
				}

				const submission2 = await referee.getSubmissionsForChallenges([i], keyIds[0]);
				assert.equal(submission2[0].submitted, true, "The submission was not submitted");
				if (submission2[0].eligibleForPayout) {
					numBoostedPoolPayouts++;
				}
			}

			expect(numBoostedPoolPayouts).to.be.greaterThan(numSoloKeyPayouts);

			return Promise.resolve();
		}).timeout(300_000);
	}
}
