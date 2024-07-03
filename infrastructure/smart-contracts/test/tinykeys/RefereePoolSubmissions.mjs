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

        it("Pool owner should be able to submit a pool assertion & claim pool submission rewards", async function () {
            const { poolFactory, addr1, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
            const singlePrice = await nodeLicense.price(1, "");
            await nodeLicense.connect(addr1).mint(1, "", { value: singlePrice });
            const addr1MintedKeyId = await nodeLicense.totalSupply();

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

            
            // Make sure the staking pool has no balance yet
            const poolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
            
            // Claim the rewards for a pool
            await referee.connect(addr1).claimPoolSubmissionRewards(stakingPoolAddress, challengeId);
            
            // Get poolSubmissions
            const poolSubmission = await referee.PoolSubmissions(stakingPoolAddress);
            expect(poolSubmission.winningKeyCount).to.equal(1);
            expect(poolSubmission.winningKeyCount).to.equal(1);
            expect(poolSubmission.submitted).to.equal(true);
            expect(poolSubmission.claimed).to.equal(true);
            
			// Make sure the staking pool has balance now
            const poolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
            expect(poolBalance2).to.be.greaterThan(poolBalance);
        })

        it("User stakes in a pool and already submitted for their keyID & user did not submit for their keyID", async function () {

            const { poolFactory, addr1, addr2, addr3, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
            
            const addr1KeyMintPrice = await nodeLicense.price(1, "");
            const addr2KeyMintPrice = await nodeLicense.price(1, "");
            const addr3KeyMintPrice = await nodeLicense.price(1, "");

            await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
            await nodeLicense.connect(addr2).mint(1, "", { value: addr2KeyMintPrice });
            await nodeLicense.connect(addr3).mint(1, "", { value: addr3KeyMintPrice });

            const addr1MintedKeyId = await nodeLicense.totalSupply();
            const addr2MintedKeyId = await nodeLicense.totalSupply();
            const addr3MintedKeyId = await nodeLicense.totalSupply();

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
            await referee.connect(addr2).submitAssertionToChallenge(addr2MintedKeyId[0], challengeId, winningStateRoot);

            const submission = await referee.getSubmissionsForChallenges([challengeId], addr2MintedKeyId[0]);
            expect(submission[0].submitted).to.equal(true);

            // Submit a pool assertions
            await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);

            // User stakes submitted keyID into pool
            await poolFactory.connect(addr2).stakeKeys(
                stakingPoolAddress,
                [addr2MintedKeyId]
            )

            // User stakes not submitted keyID into pool
            await poolFactory.connect(addr3).stakeKeys(
                stakingPoolAddress,
                [addr3MintedKeyId]
            )

            // Get poolSubmissions
            const poolSubmission = await referee.PoolSubmissions(stakingPoolAddress);
            expect(poolSubmission.winningKeyCount).to.equal(1);
            expect(poolSubmission.winningKeyCount).to.equal(1);
            expect(poolSubmission.submitted).to.equal(true);
            expect(poolSubmission.claimed).to.equal(false);

            // Claim the rewards for a pool
            await referee.connect(addr1).claimPoolSubmissionRewards(stakingPoolAddress, challengeId);

        });

        it("User unstakes from a pool with key included in poolSubmission & user unstakes while the pool does not have a poolSubmission", async function () {
            const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
            
            const addr1KeyMintPrice = await nodeLicense.price(1, "");
            const addr2KeyMintPrice = await nodeLicense.price(1, "");

            await nodeLicense.connect(addr1).mint(1, "", { value: addr1KeyMintPrice });
            await nodeLicense.connect(addr2).mint(1, "", { value: addr2KeyMintPrice });

            const addr1MintedKeyId = await nodeLicense.totalSupply();
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

            // Successfully create un-stake request for 1 key
			await poolFactory.connect(addr2).createUnstakeKeyRequest(stakingPoolAddress, 1);

 			// Wait 60 days
            await ethers.provider.send("evm_increaseTime", [2592000 * 2]);
            await ethers.provider.send("evm_mine");

            await poolFactory.connect(addr2).unstakeKeys(stakingPoolAddress, 1, [addr2MintedKeyId]);

            // Submit assertion for unstaked key
            await referee.connect(addr2).submitAssertionToChallenge(addr2MintedKeyId, challengeId, winningStateRoot);

            // Get poolSubmissions
            const poolSubmission = await referee.PoolSubmissions(stakingPoolAddress);
            expect(poolSubmission.winningKeyCount).to.equal(1);
            expect(poolSubmission.winningKeyCount).to.equal(1);
            expect(poolSubmission.submitted).to.equal(true);
            expect(poolSubmission.claimed).to.equal(false);


            //TODO the pool does not have a pool submission
        });

        it("Check user submitsAssertion for their keyID while assigned to pool switches to submitPoolAssertion", async function () {
            const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
            const singlePrice = await nodeLicense.price(1, "");
            await nodeLicense.connect(addr1).mint(1, "", { value: singlePrice });
            const addr1MintedKeyId = await nodeLicense.totalSupply();

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

            // Submit a assertions while key assigned to a pool
            await referee.connect(addr1).submitAssertion(addr1MintedKeyId, challengeId, winningStateRoot);
            
            // Make sure the staking pool has no balance yet
            const poolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
            
            // Claim the rewards for a pool
            await referee.connect(addr1).claimPoolSubmissionRewards(stakingPoolAddress, challengeId);
            
            // Get poolSubmissions
            const poolSubmission = await referee.PoolSubmissions(stakingPoolAddress);
            expect(poolSubmission.winningKeyCount).to.equal(1);
            expect(poolSubmission.winningKeyCount).to.equal(1);
            expect(poolSubmission.submitted).to.equal(true);
            expect(poolSubmission.claimed).to.equal(true);
            
			// Make sure the staking pool has balance now
            const poolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
            expect(poolBalance2).to.be.greaterThan(poolBalance);
        })

        it("Check the amount of winning keys for pools based on keys staked and boostfactor", async function () {
            //TODO check winning amount of keys for 1, 10, 100, 1000 keys 
            const { referee } = await loadFixture(deployInfrastructure);
            const stakingTierThresholds = await referee.stakeAmountTierThresholds;
                        
            // Test configurations for key amounts and expected winning counts per tier
            const keyAmountTests = [
                { keysToMint: 1, expectedWinningCounts: [0, 0, 0, 0, 0] },
                { keysToMint: 10, expectedWinningCounts: [0, 0, 0, 1, 1] },
                { keysToMint: 100, expectedWinningCounts: [1, 2, 2, 5, 7] },
                { keysToMint: 1000, expectedWinningCounts: [10, 15, 20, 50, 70] },
            ];

            for (let testCase of keyAmountTests) {
                const { keysToMint, expectedWinningCounts } = testCase;

                for (let j = 0; j < stakingTierThresholds.length; j++) {
                    const winningKeyCount = await referee.getWinningKeyCount(keysToMint, stakingTierThresholds[j]);
                    const expectedWinningCount = expectedWinningCounts[j];
                    const tolerance = Math.ceil(0.10 * expectedWinningCount);

                    const minExpected = Math.max(0, expectedWinningCount - tolerance);
                    const maxExpected = expectedWinningCount + tolerance;

                    expect(winningKeyCount).to.be.within(minExpected, maxExpected);
                }
            }            
        })
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
