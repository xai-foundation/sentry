import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {findWinningStateRoot} from "../Referee.mjs";

function PoolSubmissionsStakeAndUnstake(deployInfrastructure, poolConfigurations) {
    const {
        validShareValues,
        poolMetaData,
        poolSocials,
        poolTrackerDetails,
        noDelegateOwner,
    } = poolConfigurations;

    return function () {

        // it("Check that a pool owner can submit poolAssertions, and claimPoolSubmission rewards successfully.", async function () {
        //     const { poolFactory, addr1, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

        //     // Mint additional keys so that there are enough keys to stake in the pool and earn a reward
        //     const keysToMintForAddr1 = 180n;

        //     // Mint keys for addr1
        //     const totalPrice = await nodeLicense.price(keysToMintForAddr1, "");
        //     await nodeLicense.connect(addr1).mint(keysToMintForAddr1, "", { value: totalPrice });
        //     const addr1MintedKeyId = await nodeLicense.totalSupply();

        //     // Count backwards from the last minted keyId to get the keyIds to stake in the pool
		// 	const addr1MintedKeyIds = [];
		// 	for (let i = addr1MintedKeyId ; i > addr1MintedKeyId - keysToMintForAddr1; i--) {
		// 		addr1MintedKeyIds.push(i);
		// 	}
            
        //     // Create a pool
        //     await poolFactory.connect(addr1).createPool(
        //         noDelegateOwner,
        //         [addr1MintedKeyId],
        //         validShareValues,
        //         poolMetaData,
        //         poolSocials,
        //         poolTrackerDetails
        //     );

        //     const poolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

        //     // Stake the remaining keys in the pool minus the one that was submitted at pool creation
        //     await poolFactory.connect(addr1).stakeKeys(poolAddress, addr1MintedKeyIds.slice(1));

        //     const challengeId = 0;
            
        //     // Get the winning state root for the challenge
        //     const keys = [addr1MintedKeyId]; 
            
        //     const winningStateRoot = await findWinningStateRoot(referee, keys, challengeId);
        //     // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        //     await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

        //     // Submit a challenge
        //     const startingAssertion = 100;
        //     await referee.connect(challenger).submitChallenge(
        //         startingAssertion,
        //         startingAssertion - 1,
        //         winningStateRoot,
        //         0,
        //         "0x0000000000000000000000000000000000000000000000000000000000000000"
        //     );

        //     // Make sure the challenge is open for submissions
        //     const { openForSubmissions } = await referee.getChallenge(0);
        //     expect(openForSubmissions).to.equal(true);

        //     const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

        //     // Confirm that the poolSubmission does not exist before submitting a pool assertion
        //     const poolSubmissionBefore = await referee.poolSubmissions(challengeId, stakingPoolAddress);
        //     expect(poolSubmissionBefore.submitted).to.equal(false);
        //     expect(poolSubmissionBefore.stakedKeyCount).to.equal(0);

        //     // Submit a pool assertions
        //     await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);

        //     // Confirm that the poolSubmission was created and the staked key count is correct
        //     const poolSubmissionAfter = await referee.poolSubmissions(challengeId, stakingPoolAddress);
        //     expect(poolSubmissionAfter.submitted).to.equal(true);
        //     expect(poolSubmissionAfter.stakedKeyCount).to.equal(keysToMintForAddr1);
            
        //     // Make sure the staking pool has no balance yet
        //     const poolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
        //     expect(poolBalance).to.equal(0);

        //     // Submit a new challenge to make the previous one claimable
        //     const startingAssertion2 = startingAssertion + 1;

        //     await referee.connect(challenger).submitChallenge(
        //         startingAssertion2,
        //         startingAssertion2 - 1,
        //         winningStateRoot,
        //         0,
        //         "0x0000000000000000000000000000000000000000000000000000000000000000"
        //     );
            
        //     // Claim the rewards for a pool
        //     await referee.connect(addr1).claimPoolSubmissionRewards(stakingPoolAddress, challengeId);
            
        //     // Get poolSubmissions    
        //     const poolSubmission = await referee.poolSubmissions(challengeId, stakingPoolAddress);
        //     expect(poolSubmission.winningKeyCount).to.be.gt(0);
        //     expect(poolSubmission.submitted).to.equal(true);
        //     expect(poolSubmission.claimed).to.equal(true);
            
		// 	// Make sure the staking pool has balance now
        //     const poolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
        //     expect(poolBalance2).to.be.greaterThan(poolBalance);
        // })

        // it("Check that a previously submitted keyId should not be added to poolSubmission submitted key count", async function () {
        //     const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

        //     // Mint Node Licenses
        //     const addr1KeyMintPrice = await nodeLicense.price(1, "");
        //     const addr2KeyMintPrice = await nodeLicense.price(1, "");

        //     await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
        //     const addr1MintedKeyId = await nodeLicense.totalSupply();

        //     await nodeLicense.connect(addr2).mint(1, "", { value: addr2KeyMintPrice });
        //     const addr2MintedKeyId = await nodeLicense.totalSupply();

        //     // Create a pool
        //     await poolFactory.connect(addr1).createPool(
        //         noDelegateOwner,
        //         [addr1MintedKeyId],
        //         validShareValues,
        //         poolMetaData,
        //         poolSocials,
        //         poolTrackerDetails
        //     );

        //     const challengeId = 0;
        //     const keys = [addr1MintedKeyId];
        //     const winningStateRoot = await findWinningStateRoot(referee, keys, challengeId);

        //     // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        //     await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

        //     // Submit a challenge
        //     const startingAssertion = 100;
        //     await referee.connect(challenger).submitChallenge(
        //         startingAssertion,
        //         startingAssertion - 1,
        //         winningStateRoot,
        //         0,
        //         "0x0000000000000000000000000000000000000000000000000000000000000000"
        //     );

        //     // Make sure the challenge is open for submissions
        //     const { openForSubmissions } = await referee.getChallenge(0);
        //     expect(openForSubmissions).to.equal(true);

        //     const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

        //     // Submit assertion to check the key on stake is not added to the poolSubmission
        //     // Note the key was submitted and owned by address 2
        //     await referee.connect(addr2).submitAssertionToChallenge(addr2MintedKeyId, challengeId, winningStateRoot);

        //     // Confirm key was submitted for
        //     const submission = await referee.getSubmissionsForChallenges([challengeId], addr2MintedKeyId);
        //     expect(submission[0].submitted).to.equal(true);
            
        //     // Submit a pool assertions
        //     // Note the keys and pool address are owned by address 1
        //     await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);

        //     // Confirm pool submission was created and key counts are correct
        //     const poolSubmissionBeforeStaker = await referee.poolSubmissions(challengeId, stakingPoolAddress);
        //     expect(poolSubmissionBeforeStaker.pendingStakedKeys).to.equal(0);
        //     expect(poolSubmissionBeforeStaker.stakedKeyCount).to.equal(1);
        //     expect(poolSubmissionBeforeStaker.submitted).to.equal(true);
        //     expect(poolSubmissionBeforeStaker.claimed).to.equal(false);


        //     // Address 2 now stakes previously submitted keyId into pool
        //     console.log("Staking key for address 2:", addr2MintedKeyId);
        //     await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [addr2MintedKeyId]);

        //     // Get poolSubmissions
        //     const poolSubmissionAfterStaker = await referee.poolSubmissions(challengeId, stakingPoolAddress);
        //     console.log("After:", poolSubmissionAfterStaker);
        //     expect(poolSubmissionAfterStaker.stakedKeyCount).to.equal(1);
        //     expect(poolSubmissionBeforeStaker.pendingStakedKeys).to.equal(1);
        //     expect(poolSubmissionAfterStaker.submitted).to.equal(true);
        //     expect(poolSubmissionAfterStaker.claimed).to.equal(false);
        // });

        // it("Check that an existing pool submission's stakedKyCount increases when an un-submitted key is staked", async function () {
        //     const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

        //     // Mint Node Licenses
        //     const addr1KeyMintPrice = await nodeLicense.price(1, "");
        //     const addr2KeyMintPrice = await nodeLicense.price(1, "");

        //     await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
        //     const addr1MintedKeyId = await nodeLicense.totalSupply();

        //     await nodeLicense.connect(addr2).mint(1, "", { value: addr2KeyMintPrice });
        //     const addr2MintedKeyId = await nodeLicense.totalSupply();

        //     // Create a pool
        //     await poolFactory.connect(addr1).createPool(
        //         noDelegateOwner,
        //         [addr1MintedKeyId],
        //         validShareValues,
        //         poolMetaData,
        //         poolSocials,
        //         poolTrackerDetails
        //     );

        //     const challengeId = 0;
        //     const keys = [addr1MintedKeyId];
        //     const winningStateRoot = await findWinningStateRoot(referee, keys, challengeId);

        //     // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        //     await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

        //     // Submit First challenge
        //     const startingAssertion = 100;
        //     await referee.connect(challenger).submitChallenge(
        //         startingAssertion,
        //         startingAssertion - 1,
        //         winningStateRoot,
        //         0,
        //         "0x0000000000000000000000000000000000000000000000000000000000000000"
        //     );

        //     // Make sure the challenge is open for submissions
        //     const { openForSubmissions } = await referee.getChallenge(challengeId);            
        //     expect(openForSubmissions).to.equal(true);
            
        //     const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

        //     // Submit a pool assertion for first challenge
        //     await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);

        //     // Confirm pool submission was created and key counts are correct
        //     const poolSubmission = await referee.poolSubmissions(challengeId, stakingPoolAddress);
        //     expect(poolSubmission.stakedKeyCount).to.equal(1);
        //     expect(poolSubmission.submitted).to.equal(true);
        //     expect(poolSubmission.claimed).to.equal(false);

        //     // User stakes not submitted keyID into pool
        //     await poolFactory.connect(addr2).stakeKeys(
        //         stakingPoolAddress,
        //         [addr2MintedKeyId]
        //     )
            
        //     const poolSubmissionAfterStake = await referee.poolSubmissions(challengeId, stakingPoolAddress);

        //     // Confirm pool submission was updated and key count was increased
        //     expect(poolSubmissionAfterStake.stakedKeyCount).to.equal(2);
        //     expect(poolSubmissionAfterStake.submitted).to.equal(true);
        //     expect(poolSubmissionAfterStake.claimed).to.equal(false);
        // });
        
        it("Check that an existing poolSubmission's stakedKeyCount decreases upon the un-staking of a key.", async function () {
            const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
            
            const addr1KeyMintPrice = await nodeLicense.price(1, "");
            const addr2KeyMintPrice = await nodeLicense.price(1, "");

            await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
            const addr1MintedKeyId = await nodeLicense.totalSupply();

            await nodeLicense.connect(addr2).mint(1, "", { value: addr2KeyMintPrice });
            const addr2MintedKeyId = await nodeLicense.totalSupply();

            // Create a pool with the newly minted key
            await poolFactory.connect(addr1).createPool(
                noDelegateOwner,
                [addr1MintedKeyId],
                validShareValues,
                poolMetaData,
                poolSocials,
                poolTrackerDetails
            );
            
            // Submit a pool assertion while both keys are staked
            const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

             // Stake key into pool to later check the stakedKeyCount after unstake 
             // Pool should now have 2 staked keys prior to first pool assertion
                await poolFactory.connect(addr2).stakeKeys(
                stakingPoolAddress,
                [addr2MintedKeyId]
            );

            // Confirm the pool has 2 staked keys
            expect(await referee.assignedKeysToPoolCount(stakingPoolAddress)).to.equal(2);

            const challengeId = 0;
            const keys = [addr1MintedKeyId];
            const winningStateRoot = await findWinningStateRoot(referee, keys, challengeId);

            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

            // Submit a challenge
            const startingAssertion = 100;
            await referee.connect(challenger).submitChallenge(
                startingAssertion,
                startingAssertion - 1,
                winningStateRoot,
                0,
                "0x0000000000000000000000000000000000000000000000000000000000000000"
            );

            // Immediately request unstake of key
            // Successfully create un-stake request for 1 key
			await poolFactory.connect(addr2).createUnstakeKeyRequest(stakingPoolAddress, 1);

            // Wait 8 days
            const duration = 60 * 60 * 24 * 8; // 8 days
            await ethers.provider.send("evm_increaseTime", [duration]);
            await ethers.provider.send("evm_mine");

            await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);

            // Get poolSubmission after poolAssertion to check the stakedKeyCount
            const poolSubmissionBeforeUnstake = await referee.poolSubmissions(challengeId, stakingPoolAddress);
            expect(poolSubmissionBeforeUnstake.stakedKeyCount).to.equal(2);
            expect(poolSubmissionBeforeUnstake.submitted).to.equal(true);
            expect(poolSubmissionBeforeUnstake.claimed).to.equal(false);

            // Complete the unstake request after pool assertion has been submitted
            await poolFactory.connect(addr2).unstakeKeys(stakingPoolAddress, 0, [addr2MintedKeyId]);
            
            // Confirm the existing poolSubmission's stakedKeyCount is updated after unstake
            const poolSubmissionAfterUnstake = await referee.poolSubmissions(challengeId, stakingPoolAddress);
            expect(poolSubmissionAfterUnstake.stakedKeyCount).to.equal(1);
            expect(poolSubmissionAfterUnstake.submitted).to.equal(true);
            expect(poolSubmissionAfterUnstake.claimed).to.equal(false);

            // Submit assertion for un-staked key to check if possible to submit a assertion
            await referee.connect(addr2).submitAssertionToChallenge(addr2MintedKeyId, challengeId, winningStateRoot);

            // Confirm the key was submitted for the challenge
            const submission = await referee.submissions(0, addr2MintedKeyId);
            expect(submission.submitted).to.equal(true);
        });

        // it("Check submitAssertion for a staked keyId creates poolSubmission", async function () {
        //     const { poolFactory, addr1, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
            
        //     const addr1KeyMintPrice = await nodeLicense.price(1, "");
        //     await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
        //     const addr1MintedKeyId = await nodeLicense.totalSupply();

        //     const challengeId = 0;
        //     const keys = [addr1MintedKeyId];
        //     const winningStateRoot = await findWinningStateRoot(referee, keys, challengeId);
        //     // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        //     await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

        //     // Submit a challenge
        //     const startingAssertion = 100;
        //     await referee.connect(challenger).submitChallenge(
        //         startingAssertion,
        //         startingAssertion - 1,
        //         winningStateRoot,
        //         0,
        //         "0x0000000000000000000000000000000000000000000000000000000000000000"
        //     );

        //     // Make sure the challenge is open for submissions
        //     const { openForSubmissions } = await referee.getChallenge(0);
        //     expect(openForSubmissions).to.equal(true);

        //     // Create a pool
        //     await poolFactory.connect(addr1).createPool(
        //         noDelegateOwner,
        //         [addr1MintedKeyId],
        //         validShareValues,
        //         poolMetaData,
        //         poolSocials,
        //         poolTrackerDetails
        //     );

        //     const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

        //     // Submit a assertion to check if a poolSubmission gets created
        //     await referee.connect(addr1).submitAssertionToChallenge(addr1MintedKeyId, challengeId, winningStateRoot);

        //     // Get poolSubmission to check if the poolSubmission is created
        //     const poolSubmission1 = await referee.poolSubmissions(challengeId, stakingPoolAddress);
        //     // expect(poolSubmission1.winningKeyCount).to.equal(2); //TODO Cannot know winning key amount
        //     expect(poolSubmission1.stakedKeyCount).to.equal(1);
        //     expect(poolSubmission1.submitted).to.equal(true);
        //     expect(poolSubmission1.claimed).to.equal(false);
        // });

        // it("Check claim of staked keyId", async function () {
        //     const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
            
        //     const addr1KeyMintPrice = await nodeLicense.price(1, "");
        //     const addr2KeyMintPrice = await nodeLicense.price(1, "");

        //     await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
        //     const addr1MintedKeyId = await nodeLicense.totalSupply();

        //     await nodeLicense.connect(addr2).mint(1, "", { value: addr2KeyMintPrice });
        //     const addr2MintedKeyId = await nodeLicense.totalSupply();

        //     // Create a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
        //     await poolFactory.connect(addr1).createPool(
        //         noDelegateOwner,
        //         [addr1MintedKeyId],
        //         validShareValues,
        //         poolMetaData,
        //         poolSocials,
        //         poolTrackerDetails
        //     );

        //     const challengeId = 0;
        //     const keys = [addr1MintedKeyId];
        //     const winningStateRoot = await findWinningStateRoot(referee, keys, challengeId);
        //     // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        //     await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

        //     // Submit a challenge
        //     const startingAssertion = 100;
        //     await referee.connect(challenger).submitChallenge(
        //         startingAssertion,
        //         startingAssertion - 1,
        //         winningStateRoot,
        //         0,
        //         "0x0000000000000000000000000000000000000000000000000000000000000000"
        //     );

        //     // Make sure the challenge is open for submissions
        //     const { openForSubmissions } = await referee.getChallenge(0);
        //     expect(openForSubmissions).to.equal(true);

        //     const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

        //     // Submit a assertions while key assigned to a pool with winningStateRoot
        //     await referee.connect(addr1).submitAssertionToChallenge(addr1MintedKeyId, challengeId, winningStateRoot);

        //     const duration = 60 * 75 // 75 minutes

        //     await network.provider.send("evm_increaseTime", [duration]);
        //     await network.provider.send("evm_mine");
            
        //     // Submit a new challenge so that the previous one is claimable
        //     const startingAssertion2 = startingAssertion + 1;

        //     await referee.connect(challenger).submitChallenge(
        //         startingAssertion2,
        //         startingAssertion2 - 1,
        //         winningStateRoot,
        //         0,
        //         "0x0000000000000000000000000000000000000000000000000000000000000000"
        //     );
            
        //     // Claim the rewards for a pool
        //     // TODO/Note this will fail because submitting for a single keyID is not likely to win a reward
        //     // resulting in a division by zero error due to number of eligible claimers being 0;
        //     // await referee.connect(addr1).claimPoolSubmissionRewards(stakingPoolAddress, challengeId);
            
        //     // Check if user can claim the reward
        //     await referee.claimReward(addr1MintedKeyId, challengeId);
		// 	// Make sure the staking pool has balance now
        //     // TODO/Note this will fail because submitting for a single keyID is not likely to win a reward
        //     // resulting in a division by zero error due to number of eligible claimers being 0;
        //     //const poolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
        //     //expect(poolBalance2).to.be.greaterThan(poolBalance);
        // })
    }
}

function PoolSubmissionsRewardRate(deployInfrastructure) {

    return function () {

    it("Confirm the amount of winning keys for pools falls within acceptable tolerances for simulated runs.", async function () {
        const { refereeCalculations, addr1 } = await loadFixture(deployInfrastructure);
        const stakingBoostFactors = [150, 200, 300, 700];
        const keyAmountTests = [1, 10, 200, 1000]; // Test cases for staked key amounts
        const iterations = 100;  // Number of times to run each test case

        // Run tests for each key amount in the keyAmountTests array
        for (let stakedKeyCount of keyAmountTests) {
            // Run tests for each boost factor in the stakingBoostFactors array
            for (let boostFactor of stakingBoostFactors) {
                let totalWinningKeys = BigInt(0);
                // Tracking the minimum and maximum winning key counts for each test case
                let minWinningKeys = BigInt(Number.MAX_SAFE_INTEGER);
                let maxWinningKeys = BigInt(0);
                let results = [];
                
                // Run the test case for the current key amount and boost factor
                // multiple times to get an average winning key count
                for (let i = 0; i < iterations; i++) {
                    // Get the winning key count for the current test case iteration
                    const winningKeyCount = await refereeCalculations.getWinningKeyCount(
                        stakedKeyCount, 
                        boostFactor, 
                        await addr1.getAddress(), // Pool address will be used in production for the seed
                        i,  // Use iteration as challengeId for variety
                        ethers.randomBytes(32),  // Random confirmData
                        ethers.randomBytes(32)   // Random challengerSignedHash
                    );
                    
                    // The amount of winning keys returned from the simulation
                    const winningKeysBigInt = BigInt(winningKeyCount);
                    // Add the winning key count to the total for the specific test case simulation
                    totalWinningKeys += winningKeysBigInt;
                    // Update the minimum and maximum winning key counts for the test case if applicable
                    minWinningKeys = winningKeysBigInt < minWinningKeys ? winningKeysBigInt : minWinningKeys;
                    maxWinningKeys = winningKeysBigInt > maxWinningKeys ? winningKeysBigInt : maxWinningKeys;
                    // Store the results for the test case
                    results.push(Number(winningKeysBigInt));
                }

                // Calculate the average winning key count for the test case
                const averageWinningKeys = Number(totalWinningKeys) / iterations;
                // Calculate the expected winning key count based on the staked key amount and boost factor
                const expectedWinningKeys = (stakedKeyCount * boostFactor) / 10000;
                // Calculate the maximum allowable tolerance for variance of expectations
                const tolerance = Math.max(1, expectedWinningKeys * 0.1);  // 10% tolerance or at least 1

                // TODO - Remove console.log statements once we are confident in the algorithm

                console.log(`Staked Keys: ${stakedKeyCount}, Boost Factor: ${boostFactor}`);
                console.log(`Average Winning Keys: ${averageWinningKeys.toFixed(2)}`);
                console.log(`Expected Winning Keys: ${expectedWinningKeys.toFixed(2)}`);
                console.log(`Minimum Winning Keys: ${minWinningKeys}`);
                console.log(`Maximum Winning Keys: ${maxWinningKeys}`);
                console.log(`Tolerance: ±${tolerance.toFixed(2)}`);

                expect(averageWinningKeys).to.be.within(
                    expectedWinningKeys - tolerance,
                    expectedWinningKeys + tolerance
                );

                console.log("Test passed");
                console.log("--------------------");
            }
        }
    }).timeout(300000);;

    }
}

function getBasicPoolConfiguration() {
	const poolName1 = "Testing Pool";
	const poolDescription1 = "This is for testing purposes only!!";
	const poolLogo1 = "Pool Logo";

	return {
		validShareValues: [50_000n, 850_000n, 100_000n],
		poolName: poolName1,
		poolDescription: poolDescription1,
		poolLogo: poolLogo1,
		poolMetaData: [poolName1, poolDescription1, poolLogo1],
		poolSocials: ["Social 1", "Social 2", "Social 3"],
		poolTrackerNames: ["Tracker Name 1", "Tracker Name 2", "Tracker Name 3"],
		poolTrackerSymbols: ["Tracker Symbol 1", "Tracker Symbol 2", "Tracker Symbol 3"],
		poolTrackerDetails: [
			["Tracker Name 1", "TS1"],
			["Tracker Name 2", "TS2"],
		],
		noDelegateOwner: ethers.ZeroAddress,
	};
}

export function RefereePoolSubmissions(deployInfrastructure) {
	return function () {

		describe("Check edge cases for pool submissions", PoolSubmissionsStakeAndUnstake(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
        //describe("Check pool submission reward", PoolSubmissionsRewardRate(deployInfrastructure).bind(this));
	}
}
