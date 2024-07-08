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

        it("Check for poolSubmissions the submitPoolAssertion and claimPoolSubmissionRewards for a pool owner", async function () {
            const { poolFactory, addr1, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
            // Have to mint additional keys so that there are enough keys to stake in the pool and earn a reward
            const keysToMintForAddr1 = 180n;

            const totalPrice = await nodeLicense.price(keysToMintForAddr1, "");
            await nodeLicense.connect(addr1).mint(keysToMintForAddr1, "", { value: totalPrice });
            const addr1MintedKeyId = await nodeLicense.totalSupply();
            
			const addr1MintedKeyIds = [];
			for (let i = addr1MintedKeyId ; i > addr1MintedKeyId - keysToMintForAddr1; i--) {
				addr1MintedKeyIds.push(i);
			}
            
            // Create a pool
            await poolFactory.connect(addr1).createPool(
                noDelegateOwner,
                [addr1MintedKeyId],
                validShareValues,
                poolMetaData,
                poolSocials,
                poolTrackerDetails
            );

            const poolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

            // Stake the remaining keys in the pool minus the one that was submitted at pool creation
            await poolFactory.connect(addr1).stakeKeys(poolAddress, addr1MintedKeyIds.slice(1));


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

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(0);
            expect(openForSubmissions).to.equal(true);

            const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

            // Submit a pool assertions
            await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);

            const duration = 60 * 75 // 75 minutes

            await network.provider.send("evm_increaseTime", [duration]);
            await network.provider.send("evm_mine");
            
            // Make sure the staking pool has no balance yet
            const poolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);

            // Submit a new challenge to make the previous one claimable
            const startingAssertion2 = startingAssertion + 1;

            await referee.connect(challenger).submitChallenge(
                startingAssertion2,
                startingAssertion2 - 1,
                winningStateRoot,
                0,
                "0x0000000000000000000000000000000000000000000000000000000000000000"
            );
            
            // Claim the rewards for a pool
            await referee.connect(addr1).claimPoolSubmissionRewards(stakingPoolAddress, challengeId);
            
            // Get poolSubmissions    
            const poolSubmission = await referee.poolSubmissions(challengeId, stakingPoolAddress);
            expect(poolSubmission.winningKeyCount).to.be.gt(0);
            expect(poolSubmission.submitted).to.equal(true);
            expect(poolSubmission.claimed).to.equal(true);
            
			// Make sure the staking pool has balance now
            const poolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
            expect(poolBalance2).to.be.greaterThan(poolBalance);
        })

        it("Check keyId with submission is not included into poolSubmission after staking to pool", async function () {
            const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

            const addr1KeyMintPrice = await nodeLicense.price(1, "");
            const addr2KeyMintPrice = await nodeLicense.price(1, "");

            await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
            const addr1MintedKeyId = await nodeLicense.totalSupply();

            await nodeLicense.connect(addr2).mint(1, "", { value: addr2KeyMintPrice });
            const addr2MintedKeyId = await nodeLicense.totalSupply();

            // Create a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
            await poolFactory.connect(addr1).createPool(
                noDelegateOwner,
                [addr1MintedKeyId],
                validShareValues,
                poolMetaData,
                poolSocials,
                poolTrackerDetails
            );

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

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(0);
            expect(openForSubmissions).to.equal(true);

            const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

            // User submits with his keyID
            await referee.connect(addr2).submitAssertionToChallenge(addr2MintedKeyId, challengeId, winningStateRoot);

            const submission = await referee.getSubmissionsForChallenges([challengeId], addr2MintedKeyId);
            expect(submission[0].submitted).to.equal(true);
            
            // Submit a pool assertions
            await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);

            // Stake submitted keyID into pool
            await poolFactory.connect(addr2).stakeKeys(
                stakingPoolAddress,
                [addr2MintedKeyId]
            )

            // Get poolSubmissions
            const poolSubmission = await referee.poolSubmissions(challengeId, stakingPoolAddress);
            // expect(poolSubmission.winningKeyCount).to.equal(1); //TODO Cannot know winning key amount
            expect(poolSubmission.stakedKeyCount).to.equal(1);
            expect(poolSubmission.submitted).to.equal(true);
            expect(poolSubmission.claimed).to.equal(false);
        });

        it("Check keyId without submission increases stakedKeys for poolSubmission after staking to pool", async function () {
            const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

            const addr1KeyMintPrice = await nodeLicense.price(1, "");
            const addr2KeyMintPrice = await nodeLicense.price(1, "");

            await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
            const addr1MintedKeyId = await nodeLicense.totalSupply();

            await nodeLicense.connect(addr2).mint(1, "", { value: addr2KeyMintPrice });
            const addr2MintedKeyId = await nodeLicense.totalSupply();

            // Create a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
            await poolFactory.connect(addr1).createPool(
                noDelegateOwner,
                [addr1MintedKeyId],
                validShareValues,
                poolMetaData,
                poolSocials,
                poolTrackerDetails
            );

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

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(0);
            expect(openForSubmissions).to.equal(true);

            
            const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

            // Submit a pool assertions
            await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);

            // Get poolSubmissions
            const poolSubmission = await referee.poolSubmissions(challengeId, stakingPoolAddress);
            // expect(poolSubmission.winningKeyCount).to.equal(1); //TODO Cannot know winning key amount
            expect(poolSubmission.stakedKeyCount).to.equal(1);
            expect(poolSubmission.submitted).to.equal(true);
            expect(poolSubmission.claimed).to.equal(false);

            // User stakes not submitted keyID into pool
            await poolFactory.connect(addr2).stakeKeys(
                stakingPoolAddress,
                [addr2MintedKeyId]
            )

            // Get poolSubmissions
            const poolSubmission2 = await referee.poolSubmissions(challengeId, stakingPoolAddress);
            // expect(poolSubmission2.winningKeyCount).to.equal(2); //TODO Cannot know winning key amount
            expect(poolSubmission2.stakedKeyCount).to.equal(2);
            expect(poolSubmission2.submitted).to.equal(true);
            expect(poolSubmission2.claimed).to.equal(false);
        });

        
        it("Check keyId without submission on unstake reduces the number of stakedKeys for a poolSubmission", async function () {
            const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
            
            const addr1KeyMintPrice = await nodeLicense.price(1, "");
            const addr2KeyMintPrice = await nodeLicense.price(1, "");

            await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
            const addr1MintedKeyId = await nodeLicense.totalSupply();

            await nodeLicense.connect(addr2).mint(1, "", { value: addr2KeyMintPrice });
            const addr2MintedKeyId = await nodeLicense.totalSupply();

            // Create a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
            await poolFactory.connect(addr1).createPool(
                noDelegateOwner,
                [addr1MintedKeyId],
                validShareValues,
                poolMetaData,
                poolSocials,
                poolTrackerDetails
            );

            // User stakes key into pool
            const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
            await poolFactory.connect(addr2).stakeKeys(
                stakingPoolAddress,
                [addr2MintedKeyId]
            )

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

            await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);

            // Get poolSubmissions
            const poolSubmission1 = await referee.poolSubmissions(challengeId, stakingPoolAddress);
            // expect(poolSubmission1.winningKeyCount).to.equal(2); //TODO Cannot know winning key amount
            expect(poolSubmission1.stakedKeyCount).to.equal(2);
            expect(poolSubmission1.submitted).to.equal(true);
            expect(poolSubmission1.claimed).to.equal(false);

            // Successfully create un-stake request for 1 key
            // Shouldn't this function return the index?
			await poolFactory.connect(addr2).createUnstakeKeyRequest(stakingPoolAddress, 1);

 			// Wait 60 days
            await ethers.provider.send("evm_increaseTime", [2592000 * 2]);
            await ethers.provider.send("evm_mine");

            await poolFactory.connect(addr2).unstakeKeys(stakingPoolAddress, 0, [addr2MintedKeyId]);
            
            // Get poolSubmissions
            const poolSubmission = await referee.poolSubmissions(challengeId, stakingPoolAddress);
            //expect(poolSubmission.winningKeyCount).to.equal(1); //TODO Cannot know winning key amount
            expect(poolSubmission.stakedKeyCount).to.equal(1);
            expect(poolSubmission.submitted).to.equal(true);
            expect(poolSubmission.claimed).to.equal(false);

            // Submit assertion for unstaked key
            await referee.connect(addr2).submitAssertionToChallenge(addr2MintedKeyId, challengeId, winningStateRoot);

            const submission = await referee.submissions(0, addr2MintedKeyId);
            expect(submission.submitted).to.equal(true);
        });

        it("Check submitAssertion for a staked keyId creates poolSubmission", async function () {
            const { poolFactory, addr1, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
            
            const addr1KeyMintPrice = await nodeLicense.price(1, "");
            await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
            const addr1MintedKeyId = await nodeLicense.totalSupply();

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

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(0);
            expect(openForSubmissions).to.equal(true);

            // Create a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
            await poolFactory.connect(addr1).createPool(
                noDelegateOwner,
                [addr1MintedKeyId],
                validShareValues,
                poolMetaData,
                poolSocials,
                poolTrackerDetails
            );

            const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

            await referee.connect(addr1).submitAssertionToChallenge(addr1MintedKeyId, challengeId, winningStateRoot);

            // Get poolSubmissions
            const poolSubmission1 = await referee.poolSubmissions(challengeId, stakingPoolAddress);
            // expect(poolSubmission1.winningKeyCount).to.equal(2); //TODO Cannot know winning key amount
            expect(poolSubmission1.stakedKeyCount).to.equal(1);
            expect(poolSubmission1.submitted).to.equal(true);
            expect(poolSubmission1.claimed).to.equal(false);
        });

        // it("Check user submitsAssertion for their keyID while assigned to pool switches to submitPoolAssertion", async function () {
        //     const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
        //     const singlePrice = await nodeLicense.price(1, "");
        //     await nodeLicense.connect(addr1).mint(1, "", { value: singlePrice });
        //     const addr1MintedKeyId = await nodeLicense.totalSupply();

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

        //     // Submit a assertions while key assigned to a pool
        //     await referee.connect(addr1).submitAssertionToChallenge(addr1MintedKeyId, challengeId, winningStateRoot);

        //     const duration = 60 * 75 // 75 minutes

        //     await network.provider.send("evm_increaseTime", [duration]);
        //     await network.provider.send("evm_mine");
            
        //     // Make sure the staking pool has no balance yet
        //     // const poolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);

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
            
        //     // Get poolSubmissions
        //     const poolSubmission = await referee.poolSubmissions(challengeId, stakingPoolAddress);
        //     expect(poolSubmission.submitted).to.equal(true);
        //     //expect(poolSubmission.claimed).to.equal(true);
            
		// 	// Make sure the staking pool has balance now
        //     // TODO/Note this will fail because submitting for a single keyID is not likely to win a reward
        //     // resulting in a division by zero error due to number of eligible claimers being 0;
        //     //const poolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
        //     //expect(poolBalance2).to.be.greaterThan(poolBalance);
        // })

    it("Check the amount of winning keys for pools based on keys staked and boostfactor", async function () {
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

        // it("Check the amount of winning keys for pools based on keys staked and boostfactor", async function () {
        //     const { refereeCalculations, addr1 } = await loadFixture(deployInfrastructure);
        //     //TODO check winning amount of keys for 1, 10, 100, 1000 keys 
        //     const stakingBoostFactors =  [150,200,300,700];
        //     // Test configurations for key amounts and expected winning counts per tier
        //     const keyAmountTests = [
        //         { stakedKeyCount: 1, expectedWinningCounts: [0, 0, 0, 0] },
        //         { stakedKeyCount: 10, expectedWinningCounts: [0, 0, 0, 1] },
        //         { stakedKeyCount: 100, expectedWinningCounts: [1, 2, 2, 5] },
        //         { stakedKeyCount: 1000, expectedWinningCounts: [15, 20, 50, 70] },
        //     ];

        //     for (let testCase of keyAmountTests) {
        //         const { stakedKeyCount, expectedWinningCounts } = testCase;

        //         for (let j = 0; j < stakingBoostFactors.length; j++) {
        //             const winningKeyCount = await refereeCalculations.getWinningKeyCount(stakedKeyCount, stakingBoostFactors[j], await refereeCalculations.getAddress(), 0, "0x", "0x");
        //             const expectedWinningCount = expectedWinningCounts[j];
        //             console.log("stakedKeyCount: ", stakedKeyCount, "BoostFactor: ", stakingBoostFactors[j]);
        //             const tolerance = Math.ceil(0.10 * expectedWinningCount);
        //             console.log("Expected winning count: ", expectedWinningCount , "Tolerance:", tolerance);
        //             const minExpected = Math.max(0, expectedWinningCount - tolerance);
        //             const maxExpected = expectedWinningCount + tolerance;
        //             console.log("Range Expected: ", minExpected, " - ", maxExpected);
        //             const isCorrect = winningKeyCount >= minExpected && winningKeyCount <= maxExpected;
        //             console.log("Winning key count: ", winningKeyCount, "Is correct: ", isCorrect);
        //             console.log("---------------------------------------------------- ");
        //             //expect(winningKeyCount).to.be.within(minExpected, maxExpected);
        //         }
        //     }            
        // })
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
	}
}
