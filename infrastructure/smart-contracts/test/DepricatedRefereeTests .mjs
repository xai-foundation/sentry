

// These tests were written before the referee was upgraded to the new version. They are now obsolete, but we are keeping them here for reference.


import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {findWinningStateRoot} from "./Referee.mjs";
import {submitTestChallenge} from "./utils/submitTestChallenge.mjs";
import {mintBatchedLicenses, mintSingleLicense} from "./utils/mintLicenses.mjs";
import {createPool} from "./utils/createPool.mjs";

function BulkSubmissionsStakeAndUnstake(deployInfrastructure) {

    return function () {

        it("Check that a user who submits for a staked key will trigger a pool bulk submission and not an owner bulk submission.", async function () {
            const { poolFactory, addr1: poolOwner, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

            // Mint Node Licenses            
            const addr1MintedKeyIds = await mintBatchedLicenses(100n, nodeLicense, poolOwner);

            const challengeId = 0;
            const keys = [addr1MintedKeyIds[0]];
			const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";

            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

            // Submit a challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(0);
            expect(openForSubmissions).to.equal(true);

            // Create a pool
            const stakingPoolAddress = await createPool(poolFactory, poolOwner, addr1MintedKeyIds);

            // Get bulkSubmission struct to confirm the bulkSubmission is empty and the keyCount is 0 as there should not be a submission yet
            const bulkSubmissionBefore = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(bulkSubmissionBefore.keyCount).to.equal(0);
            expect(bulkSubmissionBefore.submitted).to.equal(false);

            
            // Owner submits an assertion for the pool
            await referee.connect(keyOwner).submitBulkAssertion(keyOwner.address, challengeId, stateRoot);

            // Submit an assertion using the keyId
            await referee.connect(poolOwner).submitAssertionToChallenge(addr1MintedKeyIds[0], challengeId, stateRoot);

            // Get bulkSubmission struct to confirm the bulkSubmission is created and the keyCount is correct
            const bulkSubmissionAfter = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(bulkSubmissionAfter.keyCount).to.equal(100);
            expect(bulkSubmissionAfter.submitted).to.equal(true);
            expect(bulkSubmissionAfter.claimed).to.equal(false);
            
            // Confirm that there is not an individual submission for the key
            const submission = await referee.submissions(challengeId, addr1MintedKeyIds[0]);
            expect(submission.submitted).to.equal(false);
        });

        it("Submit and claim using a single key id submit/claim assertions.", async function () {
            const { addr1, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);          
            
            // Have to mint a lot of keys to ensure we have winners in both pool submissions and individual key submissions
            const addr1MintedKeyId = await mintSingleLicense(nodeLicense, addr1);            

            const challengeId = 0;
            const winningKeys = [addr1MintedKeyId];

			const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

            // Submit a challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(0);
            expect(openForSubmissions).to.equal(true);
            
            // Confirm the winning keys submissions are marked as claimed after the user claim
            for (let i = 0; i < winningKeys.length; i++) {
                const keyId = winningKeys[i];

                // Submit a assertion for the winning key
                await referee.connect(addr1).submitAssertionToChallenge(keyId, challengeId, stateRoot);
            }

            const duration = 60 * 75 // 75 minutes

            await network.provider.send("evm_increaseTime", [duration]);
            await network.provider.send("evm_mine");
            
            // Submit a new challenge so that the previous one is claimable
            const startingAssertion2 = startingAssertion + 1;

            await submitTestChallenge(referee, challenger, startingAssertion2, stateRoot);
            
            // Claim the rewards for winning keys
            let balanceBeforeClaim = await esXai.connect(addr1).balanceOf(await addr1.getAddress());
            
            // Check if user can claim the reward
            for (let i = 0; i < winningKeys.length; i++) {
                const keyId = winningKeys[i];
                // Get the user balance before the claim
                const submissionBeforeClaim = await referee.submissions(challengeId, keyId);

                // Confirm the user has not claimed the reward yet
                expect(submissionBeforeClaim.claimed).to.equal(false);

                // Confirm the user has submitted the key
                expect(submissionBeforeClaim.submitted).to.equal(true);

                // Claim the reward for the key
                await referee.claimReward(keyId, challengeId);

                // Get the user balance after the claim
                const balanceAfterClaim = await esXai.connect(addr1).balanceOf(await addr1.getAddress());
                
                // Confirm the users balance has increased after the claim
                expect(balanceAfterClaim).to.be.greaterThan(balanceBeforeClaim);
                
                // Update the balanceBeforeClaim for the next iteration
                balanceBeforeClaim = balanceAfterClaim;

                // Get the submission after the claim
                const submissionAfterClaim = await referee.submissions(challengeId, keyId);

                // Confirm the key has been claimed
                expect(submissionAfterClaim.claimed).to.equal(true);
            }     
        }).timeout(300000);
    }
}


export function RefereeBulkSubmissions(deployInfrastructure) {
	return function () {
        describe("Check edge cases for pool submissions", BulkSubmissionsStakeAndUnstake(deployInfrastructure).bind(this));
        //describe("Check pool submission reward", BulkSubmissionsRewardRate(deployInfrastructure).bind(this));
        //describe("Check pool submission permissions", BulkSubmissionPermissions(deployInfrastructure).bind(this));
	}
}
