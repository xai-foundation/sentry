import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {findWinningStateRoot} from "../Referee.mjs";
import {submitTestChallenge} from "../utils/submitTestChallenge.mjs";
import {mintBatchedLicenses, mintSingleLicense} from "../utils/mintLicenses.mjs";
import {createPool} from "../utils/createPool.mjs";

function BulkSubmissionsStakeAndUnstake(deployInfrastructure) {

    return function () {

        it("Check that a previously submitted keyId should be canceled and added to bulkSubmission submitted key count", async function () {
            const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

            // Mint Node Licenses
            const addr1MintedKeyId = await mintSingleLicense(nodeLicense, addr1);
            const addr2MintedKeyId = await mintSingleLicense(nodeLicense, addr2);

            const challengeId = 0;
            const keys = [addr1MintedKeyId];
            const winningStateRoot = await findWinningStateRoot(referee, keys, challengeId);

            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

            // Submit a challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, winningStateRoot);

            // Create a pool
            const stakingPoolAddress = await createPool(poolFactory, addr1, keys);

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(0);
            expect(openForSubmissions).to.equal(true);

            // Submit assertion to check the key on stake is not added to the bulkSubmission
            // Note the key was submitted and owned by address 2
            await referee.connect(addr2).submitAssertionToChallenge(addr2MintedKeyId, challengeId, winningStateRoot);
            
            // Confirm key was submitted for
            const submission = await referee.getSubmissionsForChallenges([challengeId], addr2MintedKeyId);
            expect(submission[0].submitted).to.equal(true);
            
            // Submit a pool assertions
            // Note the keys and pool address are owned by address 1
            await referee.connect(addr1).submitBulkAssertion(stakingPoolAddress, challengeId, winningStateRoot);

            // Confirm pool submission was created and key counts are correct
            const bulkSubmissionBeforeStaker = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(bulkSubmissionBeforeStaker.keyCount).to.equal(1);
            expect(bulkSubmissionBeforeStaker.submitted).to.equal(true);
            expect(bulkSubmissionBeforeStaker.claimed).to.equal(false);


            // Address 2 now stakes previously submitted keyId into pool
            await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [addr2MintedKeyId]);

            // Confirm the individual submission was removed after the pool submission
            const submissionAfterStaker = await referee.getSubmissionsForChallenges([challengeId], addr1MintedKeyId);
            expect(submissionAfterStaker[0].submitted).to.equal(false);

            // Get bulkSubmissions
            const bulkSubmissionAfterStaker = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(bulkSubmissionAfterStaker.keyCount).to.equal(2);
            expect(bulkSubmissionAfterStaker.submitted).to.equal(true);
            expect(bulkSubmissionAfterStaker.claimed).to.equal(false);
        });

        it("Check that an existing pool submission's stakedKyCount increases when an un-submitted key is staked", async function () {
            const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

            // Mint Node Licenses
            const addr1MintedKeyIds = await mintBatchedLicenses(100n, nodeLicense, addr1);
            const addr2MintedKeyId = await mintSingleLicense(nodeLicense, addr2);

            const challengeId = 0;
            const keys = [addr1MintedKeyIds[0]];
            const winningStateRoot = await findWinningStateRoot(referee, keys, challengeId);

            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

            // Submit First challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, winningStateRoot);

            // Create a pool
            const stakingPoolAddress = await createPool(poolFactory, addr1, addr1MintedKeyIds);

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(challengeId);            
            expect(openForSubmissions).to.equal(true);

            // Submit a pool assertion for first challenge
            await referee.connect(addr1).submitBulkAssertion(stakingPoolAddress, challengeId, winningStateRoot);

            // Confirm pool submission was created and key counts are correct
            const bulkSubmission = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(bulkSubmission.keyCount).to.equal(100);
            expect(bulkSubmission.submitted).to.equal(true);
            expect(bulkSubmission.claimed).to.equal(false);

            // User stakes not submitted keyID into pool
            await poolFactory.connect(addr2).stakeKeys(
                stakingPoolAddress,
                [addr2MintedKeyId]
            )
            
            const bulkSubmissionAfterStake = await referee.bulkSubmissions(challengeId, stakingPoolAddress);

            // Confirm pool submission was updated and key count was increased
            expect(bulkSubmissionAfterStake.keyCount).to.equal(101);
            expect(bulkSubmissionAfterStake.submitted).to.equal(true);
            expect(bulkSubmissionAfterStake.claimed).to.equal(false);
        });
        
        it("Check that an existing bulkSubmission's keyCount decreases upon the un-staking of a key & that key can then submit and claim.", async function () {
            const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

            // Mint keys for addr1
            const addr1MintedKeyId = await mintSingleLicense(nodeLicense, addr1);
            
            // Have to mint a lot of keys to ensure we have winners in both pool submissions and individual key submissions
            const keysToMintForAddr2 = 200n;

            // Count backwards from the last minted keyId to get the keyIds to stake in the pool
			const addr2MintedKeyIds = await mintBatchedLicenses(keysToMintForAddr2, nodeLicense, addr2);

            const challengeId = 0;
            const winningKeys = [addr2MintedKeyIds[0]];
            const winningStateRoot = await findWinningStateRoot(referee, winningKeys, challengeId);

            // Submit a challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, winningStateRoot);

            // Create a pool with the newly minted key
            const stakingPoolAddress = await createPool(poolFactory, addr1, [addr1MintedKeyId]);

            // Confirm the pool has 1 staked key
            expect(await referee.assignedKeysToPoolCount(stakingPoolAddress)).to.equal(1);
            
            // Stake key into pool to later check the keyCount after unstake 
            // Pool should now have 1 staked key prior to first pool assertion             
            // split the addr2MintedKeyIds array into 2 arrays of 100 keys each
            const slice1 = addr2MintedKeyIds.slice(0, 100);
            const slice2 = addr2MintedKeyIds.slice(100, 200);

            await poolFactory.connect(addr2).stakeKeys(
                stakingPoolAddress,
                slice1
            );
            await poolFactory.connect(addr2).stakeKeys(
                stakingPoolAddress,
                slice2
            );

            // Confirm the pool has 251 staked keys
            expect(await referee.assignedKeysToPoolCount(stakingPoolAddress)).to.equal(201);

            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 10_000_000);

            // Immediately request unstake of key
            // Successfully create un-stake request for 1 key
			await poolFactory.connect(addr2).createUnstakeKeyRequest(stakingPoolAddress, 1);

            // Wait 8 days
            const duration = 60 * 60 * 24 * 8; // 8 days
            await ethers.provider.send("evm_increaseTime", [duration]);
            await ethers.provider.send("evm_mine");

            // Submit a pool assertion while both keys are staked
            await referee.connect(addr1).submitBulkAssertion(stakingPoolAddress, challengeId, winningStateRoot);

            // Get bulkSubmission after bulkAssertion to check the keyCount
            const bulkSubmissionBeforeUnstake = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(bulkSubmissionBeforeUnstake.keyCount).to.equal(201);
            expect(bulkSubmissionBeforeUnstake.submitted).to.equal(true);
            expect(bulkSubmissionBeforeUnstake.claimed).to.equal(false);

            // Complete the unstake request after pool assertion has been submitted
            await poolFactory.connect(addr2).unstakeKeys(stakingPoolAddress, 0, winningKeys);
            
            // Confirm the existing bulkSubmission's keyCount is updated after unstake
            const bulkSubmissionAfterUnstake = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(bulkSubmissionAfterUnstake.keyCount).to.equal(200);
            expect(bulkSubmissionAfterUnstake.submitted).to.equal(true);
            expect(bulkSubmissionAfterUnstake.claimed).to.equal(false);
            
            // Submit assertion for un-staked key to check if possible to submit a assertion
            await referee.connect(addr2).submitMultipleAssertions(winningKeys, challengeId, winningStateRoot);

            // Confirm the key was submitted for the challenge
            const submission = await referee.submissions(0, winningKeys[0]);
            expect(submission.submitted).to.equal(true);

            // Create a new challenge to make the previous one claimable
            const assertion2 = startingAssertion + 1;
            await submitTestChallenge(referee, challenger, assertion2, winningStateRoot);

            // Get Pool & User Balances Before Claim
            const poolBalanceBeforeClaim = await esXai.connect(addr2).balanceOf(stakingPoolAddress);
            expect(poolBalanceBeforeClaim).to.equal(0);
            const userBalanceBeforeClaim = await esXai.connect(addr2).balanceOf(await addr2.getAddress());
            expect(userBalanceBeforeClaim).to.equal(0);

            // Claim the rewards for a pool
            await referee.connect(addr1).claimBulkSubmissionRewards(stakingPoolAddress, challengeId);

            const bulkSubmissionAfterClaim = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(bulkSubmissionAfterClaim.claimed).to.equal(true);

            // Confirm the balances after the claim
            const poolBalanceAfterClaim = await esXai.connect(addr2).balanceOf(stakingPoolAddress);
            const userBalanceAfterPoolClaim = await esXai.connect(addr2).balanceOf(await addr2.getAddress());

            // Confirm the pool balance increased and the user balance did not
            expect(poolBalanceAfterClaim).to.be.greaterThan(poolBalanceBeforeClaim);
            expect(userBalanceAfterPoolClaim).to.equal(0);

            await referee.connect(addr2).claimMultipleRewards(winningKeys, challengeId, await addr2.getAddress());

            // Get user and pool balances after individual key claim
            const userBalanceAfterClaim = await esXai.connect(addr2).balanceOf(await addr2.getAddress());
            const poolBalanceAfterUserClaim = await esXai.connect(addr2).balanceOf(stakingPoolAddress);
            
            // Confirm the user balance increased after individual key claim and the pool balance did not
            expect(userBalanceAfterClaim).to.be.greaterThan(userBalanceBeforeClaim);
            expect(poolBalanceAfterUserClaim).to.equal(poolBalanceAfterClaim);

            const allKeys = slice1.concat(slice2);
            
            // Confirm the winning keys submissions are marked as claimed after the user claim
            for (let i = 0; i < winningKeys.length; i++) {             
                const submissionAfterUserClaim = await referee.submissions(challengeId, winningKeys[i]);
                expect(submissionAfterUserClaim.claimed).to.equal(true);
            }

        }).timeout(300000);

        it("Check that a user who submits for a staked key will trigger a pool submission and not an individual key submission.", async function () {
            const { poolFactory, addr1, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

            // Mint Node Licenses            
            const addr1MintedKeyIds = await mintBatchedLicenses(100n, nodeLicense, addr1);

            const challengeId = 0;
            const keys = [addr1MintedKeyIds[0]];
            const winningStateRoot = await findWinningStateRoot(referee, keys, challengeId);

            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

            // Submit a challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, winningStateRoot);

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(0);
            expect(openForSubmissions).to.equal(true);

            // Create a pool
            const stakingPoolAddress = await createPool(poolFactory, addr1, addr1MintedKeyIds);

            // Get bulkSubmission struct to confirm the bulkSubmission is empty and the keyCount is 0 as there should not be a submission yet
            const bulkSubmissionBefore = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(bulkSubmissionBefore.keyCount).to.equal(0);
            expect(bulkSubmissionBefore.submitted).to.equal(false);

            // Submit an assertion using the keyId
            await referee.connect(addr1).submitAssertionToChallenge(addr1MintedKeyIds[0], challengeId, winningStateRoot);

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

            const winningStateRoot = await findWinningStateRoot(referee, winningKeys, challengeId);
            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

            // Submit a challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, winningStateRoot);

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(0);
            expect(openForSubmissions).to.equal(true);
            
            // Confirm the winning keys submissions are marked as claimed after the user claim
            for (let i = 0; i < winningKeys.length; i++) {
                const keyId = winningKeys[i];

                // Submit a assertion for the winning key
                await referee.connect(addr1).submitAssertionToChallenge(keyId, challengeId, winningStateRoot);
            }

            const duration = 60 * 75 // 75 minutes

            await network.provider.send("evm_increaseTime", [duration]);
            await network.provider.send("evm_mine");
            
            // Submit a new challenge so that the previous one is claimable
            const startingAssertion2 = startingAssertion + 1;

            await submitTestChallenge(referee, challenger, startingAssertion2, winningStateRoot);
            
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


function BulkSubmissionPermissions(deployInfrastructure) {

    return function () {

    it("Check that a pool owner can submit bulkAssertions, and claimBulkSubmission rewards successfully.", async function () {
        const { poolFactory, addr1, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

        // Mint additional keys so that there are enough keys to stake in the pool and earn a reward
        const keysToMintForAddr1 = 175n;

        // Mint keys for addr1
        // Count backwards from the last minted keyId to get the keyIds to stake in the pool
        const addr1MintedKeyIds = await mintBatchedLicenses(keysToMintForAddr1, nodeLicense, addr1);
        
        const winningKeys = [addr1MintedKeyIds[0]];
        const winningStateRoot = await findWinningStateRoot(referee, winningKeys, 0);

        // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

        // Submit two challenges so that the contract tests will run successfully
        const startingAssertion = 100;
        
        //Start Initial Challenge Period for Challenge 0
        await submitTestChallenge(referee, challenger, startingAssertion, winningStateRoot);

        // Create a pool with the minted keys
        const poolAddress = await createPool(poolFactory, addr1, winningKeys);

        // Stake the remaining keys in the pool minus the one that was submitted at pool creation
        await poolFactory.connect(addr1).stakeKeys(poolAddress, addr1MintedKeyIds.slice(1));

        const challengeId = 0;

        // Make sure the challenge is open for submissions
        const { openForSubmissions } = await referee.getChallenge(challengeId);
        expect(openForSubmissions).to.equal(true);

        const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);

        // Confirm that the bulkSubmission does not exist before submitting a pool assertion
        const bulkSubmissionBefore = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
        expect(bulkSubmissionBefore.submitted).to.equal(false);
        expect(bulkSubmissionBefore.keyCount).to.equal(0);

        // Submit a pool assertions
        await referee.connect(addr1).submitBulkAssertion(stakingPoolAddress, challengeId, winningStateRoot);

        // Confirm that the bulkSubmission was created and the staked key count is correct
        const bulkSubmissionAfter = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
        expect(bulkSubmissionAfter.submitted).to.equal(true);
        expect(bulkSubmissionAfter.keyCount).to.equal(keysToMintForAddr1);
        
        // Make sure the staking pool has no balance yet
        const poolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
        expect(poolBalance).to.equal(0);

        // Submit a new challenge to make the previous one claimable
        const startingAssertion2 = startingAssertion + 1;
        
        await submitTestChallenge(referee, challenger, startingAssertion2, winningStateRoot);
        
        // Claim the rewards for a pool
        await referee.connect(addr1).claimBulkSubmissionRewards(stakingPoolAddress, challengeId);
        
        // Get bulkSubmissions    
        const bulkSubmission = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
        expect(bulkSubmission.winningKeyCount).to.be.gt(0);
        expect(bulkSubmission.submitted).to.equal(true);
        expect(bulkSubmission.claimed).to.equal(true);
        
        // Make sure the staking pool has balance now
        const poolBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
        expect(poolBalance2).to.be.greaterThan(poolBalance);
    })

    it("Check that a pool delegate can submit bulkAssertions, and claimBulkSubmission rewards successfully.", async function () {        
        const { poolFactory, addr1: poolOwner, addr2: poolDelegate, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);
        
        // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

        // Mint 100 keys for addr1 - choosing 100 keys to ensure that the pool has enough keys to receive a reward
        const licenseIds = await mintBatchedLicenses(100n, nodeLicense, poolOwner);

        // Submit initial challenge
        const challengeId = 0;
        const startingAssertion = 100;
        const winningStateRoot = await findWinningStateRoot(referee, [licenseIds[0]], challengeId);
        await submitTestChallenge(referee, challenger, startingAssertion, winningStateRoot);

        // Create a pool with addr1 as the owner and addr2 as the delegate
        const poolAddress = await createPool(poolFactory, poolOwner, licenseIds, poolDelegate);
        
        // Confirm address2 is the delegate for the pool
        const delegatePoolAddress = await poolFactory.poolsOfDelegate(poolDelegate, 0);
        expect(delegatePoolAddress).to.equal(poolAddress);

        // Submit a pool assertion with address2
        await referee.connect(poolDelegate).submitBulkAssertion(poolAddress, challengeId, winningStateRoot);

        // Confirm the pool submission was created and the staked key count is correct
        const bulkSubmission = await referee.bulkSubmissions(challengeId, poolAddress);
        expect(bulkSubmission.keyCount).to.equal(100);
        expect(bulkSubmission.submitted).to.equal(true);
        expect(bulkSubmission.claimed).to.equal(false);

        // Submit new challenge to make the previous one claimable
        const startingAssertion2 = startingAssertion + 1;
        await submitTestChallenge(referee, challenger, startingAssertion2, winningStateRoot);
        
        //Confirm pool balances before claim
        const poolBalanceBeforeClaim = await esXai.connect(esXaiMinter).balanceOf(poolAddress);
        expect(poolBalanceBeforeClaim).to.equal(0);

        // Submit a pool claim with address2
        await referee.connect(poolDelegate).claimBulkSubmissionRewards(poolAddress, challengeId);

        // Confirm the pool submission was claimed
        const bulkSubmissionAfterClaim = await referee.bulkSubmissions(challengeId, poolAddress);
        expect(bulkSubmissionAfterClaim.claimed).to.equal(true);

        // Confirm the pool balance increased after the claim
        const poolBalanceAfterClaim = await esXai.connect(esXaiMinter).balanceOf(poolAddress);
        expect(poolBalanceAfterClaim).to.be.greaterThan(poolBalanceBeforeClaim);

    });
    
    it("Check that a pool key staker can submit bulkAssertions, and claimBulkSubmission rewards successfully.", async function () {
        const { poolFactory, addr1:poolOwner, addr2: keyStaker, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

        // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

        // Mint 100 keys for addr1
        const licenseIds = await mintBatchedLicenses(100n, nodeLicense, poolOwner);

        // Mint 100 keys for addr2
        const licenseIds2 = await mintBatchedLicenses(100n, nodeLicense, keyStaker);

        // Submit initial challenge
        const challengeId = 0;
        const startingAssertion = 100;
        const winningStateRoot = await findWinningStateRoot(referee, [licenseIds[0]], challengeId);
        await submitTestChallenge(referee, challenger, startingAssertion, winningStateRoot);

        // Create a pool with addr1 as the owner
        const poolAddress = await createPool(poolFactory, poolOwner, licenseIds);

        // Stake keys for addr2
        await poolFactory.connect(keyStaker).stakeKeys(poolAddress, licenseIds2);

        // Submit a pool assertion with addr2
        await referee.connect(keyStaker).submitBulkAssertion(poolAddress, challengeId, winningStateRoot);

        // Confirm the pool submission was created and the staked key count is correct
        const bulkSubmission = await referee.bulkSubmissions(challengeId, poolAddress);
        expect(bulkSubmission.keyCount).to.equal(200);
        expect(bulkSubmission.submitted).to.equal(true);
        expect(bulkSubmission.claimed).to.equal(false);

        // Submit a new challenge to make the previous one claimable
        const startingAssertion2 = startingAssertion + 1;
        await submitTestChallenge(referee, challenger, startingAssertion2, winningStateRoot);


        // Check the pool balance before the claim
        const poolBalanceBeforeClaim = await esXai.connect(esXaiMinter).balanceOf(poolAddress);
        expect(poolBalanceBeforeClaim).to.equal(0);
        
        // Submit a pool claim with addr2
        await referee.connect(keyStaker).claimBulkSubmissionRewards(poolAddress, challengeId);

        // Confirm the pool submission was claimed
        const bulkSubmissionAfterClaim = await referee.bulkSubmissions(challengeId, poolAddress);
        expect(bulkSubmissionAfterClaim.claimed).to.equal(true);

        // Confirm the pool balance increased after the claim
        const poolBalanceAfterClaim = await esXai.connect(esXaiMinter).balanceOf(poolAddress);
        expect(poolBalanceAfterClaim).to.be.greaterThan(poolBalanceBeforeClaim);

    });
    
    it("Check that a pool esXai staker can submit bulkAssertions, and claimBulkSubmission rewards successfully.", async function () {
        const { poolFactory, addr1: poolOwner, addr2: esXaiStaker, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

        // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 10_000_000);        

        // Mint 100 keys for addr1
        const licenseIds = await mintBatchedLicenses(100n, nodeLicense, poolOwner);

        // Mint esXai for addr2
        await esXai.connect(esXaiMinter).mint(await esXaiStaker.getAddress(), 10_000_000);

        // Submit initial challenge
        const challengeId = 0;
        const startingAssertion = 100;
        const winningStateRoot = await findWinningStateRoot(referee, [licenseIds[0]], challengeId);
        await submitTestChallenge(referee, challenger, startingAssertion, winningStateRoot);

        // Create a pool with addr1 as the owner
        const poolAddress = await createPool(poolFactory, poolOwner, licenseIds);
        
        // Mint some esXai for addr2
        await esXai.connect(esXaiMinter).mint(await esXaiStaker.getAddress(), 100_000);

        // Stake esXai for addr2
        await esXai.connect(esXaiStaker).approve(poolFactory, 10_000_000);
        await poolFactory.connect(esXaiStaker).stakeEsXai(poolAddress, 10_000_000);        
        
        // Submit a pool assertion with addr2
        await referee.connect(esXaiStaker).submitBulkAssertion(poolAddress, challengeId, winningStateRoot);
        
        // Confirm the pool submission was created and the staked key count is correct
        const bulkSubmission = await referee.bulkSubmissions(challengeId, poolAddress);
        expect(bulkSubmission.keyCount).to.equal(100);
        expect(bulkSubmission.submitted).to.equal(true);
        expect(bulkSubmission.claimed).to.equal(false);

        // Submit a new challenge to make the previous one claimable
        const startingAssertion2 = startingAssertion + 1;
        await submitTestChallenge(referee, challenger, startingAssertion2, winningStateRoot);
        
        // Check the pool balance before the claim
        const poolBalanceBeforeClaim = await esXai.connect(esXaiMinter).balanceOf(poolAddress);
        expect(poolBalanceBeforeClaim).to.equal(0);

        // Submit a pool claim with addr2
        await referee.connect(esXaiStaker).claimBulkSubmissionRewards(poolAddress, challengeId);

        // Confirm the pool submission was claimed
        const bulkSubmissionAfterClaim = await referee.bulkSubmissions(challengeId, poolAddress);
        expect(bulkSubmissionAfterClaim.claimed).to.equal(true);

        // Confirm the pool balance increased after the claim
        const poolBalanceAfterClaim = await esXai.connect(esXaiMinter).balanceOf(poolAddress);
        expect(poolBalanceAfterClaim).to.be.greaterThan(poolBalanceBeforeClaim);

    });
    
    it("Check that a pool submission is not allowed if the submitter is not the pool owner, delegate, key staked, or esXai staked ", async function () {
        const { poolFactory, addr1: poolOwner, addr2: nonOwner, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

        // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

        // Mint 1 key for addr1
        const licenseIds = await mintBatchedLicenses(1, nodeLicense, poolOwner);

        // Submit initial challenge
        const challengeId = 0;
        const startingAssertion = 100;
        const winningStateRoot = await findWinningStateRoot(referee, licenseIds, challengeId);
        await submitTestChallenge(referee, challenger, startingAssertion, winningStateRoot);

        // Create a pool with addr1 as the owner
        const poolAddress = await createPool(poolFactory, poolOwner, licenseIds);

        // Submit a pool assertion with addr2
        await expect(referee.connect(nonOwner).submitBulkAssertion(poolAddress, challengeId, winningStateRoot)).to.be.revertedWith("17");

        // Confirm the pool submission was not created/reverted
    });

    }

}

function BulkSubmissionsRewardRate(deployInfrastructure) {

    return function () {

    it("Confirm the amount of winning keys for pools falls within acceptable tolerances for simulated runs.", async function () {
        const { refereeCalculations, addr1 } = await loadFixture(deployInfrastructure);
        const stakingBoostFactors = [150, 200, 300, 700];
        const keyAmountTests = [1, 10, 200, 1000]; // Test cases for staked key amounts
        const iterations = 100;  // Number of times to run each test case

        // Run tests for each key amount in the keyAmountTests array
        for (let keyCount of keyAmountTests) {
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
                        keyCount, 
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
                const expectedWinningKeys = (keyCount * boostFactor) / 10000;
                // Calculate the maximum allowable tolerance for variance of expectations
                const tolerance = Math.max(1, expectedWinningKeys * 0.1);  // 10% tolerance or at least 1

                // TODO - Remove console.log statements once we are confident in the algorithm

                console.log(`Staked Keys: ${keyCount}, Boost Factor: ${boostFactor}`);
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
    }).timeout(300000);

    }
}

export function RefereeBulkSubmissions(deployInfrastructure) {
	return function () {
        describe("Check edge cases for pool submissions", BulkSubmissionsStakeAndUnstake(deployInfrastructure).bind(this));
        describe("Check pool submission reward", BulkSubmissionsRewardRate(deployInfrastructure).bind(this));
        describe("Check pool submission permissions", BulkSubmissionPermissions(deployInfrastructure).bind(this));
	}
}
