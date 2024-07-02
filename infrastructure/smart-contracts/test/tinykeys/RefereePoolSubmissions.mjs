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

            // Submit a pool assertions
            await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);

            // Get poolSubmissions
            const poolSubmission = await referee.PoolSubmissions(stakingPoolAddress);
            expect(poolSubmission.winningKeyCount).to.equal(1);
            expect(poolSubmission.winningKeyCount).to.equal(1);
            expect(poolSubmission.submitted).to.equal(true);
            expect(poolSubmission.claimed).to.equal(true);

            // Make sure the staking pool has no balance yet
            const poolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);

            // Claim the rewards for a pool
            await referee.connect(addr1).claimPoolSubmissionRewards(stakingPoolAddress, challengeId);
            
			// Make sure the staking pool has balance now
            const poolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
            expect(poolBalance2).to.be.greaterThan(poolBalance);
        })

        it("User stakes in a pool and already submitted for their keyID & did not submit for their keyID", async function () {

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

            // Submit a pool assertions
            await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, winningStateRoot);
            const submission = await referee.getSubmissionsForChallenges([challengeId], addr1MintedKeyId);
            expect(submission[0].eligibleForPayout).to.equal(true);

            await poolFactory.connect(addr2).stakeKeys(
                stakingPoolAddress,
                [addr2MintedKeyId]
            )

            await poolFactory.connect(addr3).stakeKeys(
                stakingPoolAddress,
                [addr3MintedKeyId]
            )

            const submissionAfterStakeKeys = await referee.getSubmissionsForChallenges([challengeId], addr1MintedKeyId);
            expect(submissionAfterStakeKeys[0].eligibleForPayout).to.equal(true);

            // Claim the rewards for a pool
            await referee.connect(addr1).claimPoolSubmissionRewards(stakingPoolAddress, challengeId);
            
            //TODO expect to only include one key in submission
            //TODO the user did not submit for their keyID

        });

        it("User unstakes from a pool with key included in poolSubmission & the pool does not have a poolSubmission", async function () {
            //TODO 
        });

        it("User submits assertion for their keyID from an assigned pool", async function () {
            //TODO user submits assertion for a key that assigned to a pool
        });

        it("User claims for their keyID", async function () {
            //TODO user claims for his keyID that is not assigned

            //TODO user assigns key to pool

            //TODO check submission for key
        });

        it("Check the amount of winning keys for pools based on keys staked and boostfactor", async function () {
            //TODO check winning amount of keys for 1, 10, 100, 1000 keys 

            //TODO check boostfactor
            
            //TODO check ~70 keys won +/- 10% in diamond tier 7% with 1000 keys
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

		// describe("Create Pool #187167264", CreatePool(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Update Pool #187167268", UpdatePool(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Stake Key to pool #187167267", StakeKeysToPool(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Stake esXai to pool #187167334", StakeEsXaiToPool(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Verify boost factor #187167332", VerifyBoostFactor(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Rewards", Rewards(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Submitting & Claiming", SubmittingAndClaiming(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		describe("Check edge cases for pool submissions", PoolSubmissionsStakeAndUnstake(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
	}
}
