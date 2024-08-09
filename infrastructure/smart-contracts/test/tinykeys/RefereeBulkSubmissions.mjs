import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {findWinningStateRoot} from "../Referee.mjs";
import {submitTestChallenge} from "../utils/submitTestChallenge.mjs";
import {mintBatchedLicenses, mintSingleLicense} from "../utils/mintLicenses.mjs";
import {createPool} from "../utils/createPool.mjs";

function BulkSubmissionsStakeAndUnstake(deployInfrastructure) {

    return function () {

        it("Check that a previously submitted owner bulk submission should be canceled and added to the pool bulkSubmission submitted key count", async function () {
            const { poolFactory, addr1: poolOwner, addr2: keyOwner, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

            // Mint Node Licenses
            const addr1MintedKeyId = await mintSingleLicense(nodeLicense, poolOwner);
            const addr2MintedKeyId = await mintSingleLicense(nodeLicense, keyOwner);

            const challengeId = 0;
            const keys = [addr1MintedKeyId];
			const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";

            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

            // Submit a challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

            // Create a pool using address 1 as the owner
            const stakingPoolAddress = await createPool(poolFactory, poolOwner, keys);

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(0);
            expect(openForSubmissions).to.equal(true);

            // Confirm the owner bulk submission does not exist for the key owner wallet before submitting
			const ownerBulkSubmissionBefore = await referee.bulkSubmissions(challengeId, keyOwner.address);
            const ownerBulkSubmissionBeforeSubmitted = ownerBulkSubmissionBefore[0];
            const ownerBulkSubmissionBeforeKeyCount = ownerBulkSubmissionBefore[2];
            expect(ownerBulkSubmissionBeforeSubmitted).to.equal(false);
            expect(ownerBulkSubmissionBeforeKeyCount).to.equal(0);

            // Key Owner Submits an owner bulk submission
            await referee.connect(keyOwner).submitBulkAssertion(keyOwner.address, challengeId, stateRoot);
            
            // Confirm the owner bulk submission was created and the key count is correct
			// Grab the bulkSubmission 
			const ownerBulkSubmissionAfter = await referee.bulkSubmissions(challengeId, keyOwner.address);
            const ownerBulkSubmissionAfterSubmitted = ownerBulkSubmissionAfter[0];
            const ownerBulkSubmissionAfterKeyCount = ownerBulkSubmissionAfter[2];
            expect(ownerBulkSubmissionAfterSubmitted).to.equal(true);
            expect(ownerBulkSubmissionAfterKeyCount).to.equal(11n);

            // Pool Owner Submits a pool bulk submission
            // Confirm Pool Submission Does Not Exist
            const poolBulkSubmissionBefore = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            const poolBulkSubmissionBeforeSubmitted = poolBulkSubmissionBefore[0];
            const poolBulkSubmissionBeforeKeyCount = poolBulkSubmissionBefore[2];
            expect(poolBulkSubmissionBeforeSubmitted).to.equal(false);
            expect(poolBulkSubmissionBeforeKeyCount).to.equal(0);

            // Pool Owner Submits a pool bulk submission
            await referee.connect(poolOwner).submitBulkAssertion(stakingPoolAddress, challengeId, stateRoot);

            // Confirm the pool bulk submission was created and the key count is correct
            const poolBulkSubmissionAfter = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            const poolBulkSubmissionAfterSubmitted = poolBulkSubmissionAfter[0];
            const poolBulkSubmissionAfterKeyCount = poolBulkSubmissionAfter[2];
            expect(poolBulkSubmissionAfterSubmitted).to.equal(true);
            expect(poolBulkSubmissionAfterKeyCount).to.equal(1);

            // Confirm the pool staked key balance before the key owner stakes the key
            const poolStakedKeyBalanceBefore = await referee.assignedKeysToPoolCount(stakingPoolAddress);

            // Key Owner stakes the key into the pool
            await poolFactory.connect(keyOwner).stakeKeys(stakingPoolAddress, [addr2MintedKeyId]);

            // Confirm the pool staked key balance after the key owner stakes the key
            const poolStakedKeyBalanceAfter = await referee.assignedKeysToPoolCount(stakingPoolAddress);
            // Confirm the pool staked key balance increased after the key owner stakes the key
            expect(poolStakedKeyBalanceAfter).to.equal(poolStakedKeyBalanceBefore + 1n);
            
            // Confirm the owner bulk submission keyCount decreased by 1
            const ownerBulkSubmissionAfterStake = await referee.bulkSubmissions(challengeId, keyOwner.address);
            const ownerBulkSubmissionAfterStakeKeyCount = ownerBulkSubmissionAfterStake[2];
            expect(ownerBulkSubmissionAfterStakeKeyCount).to.equal(ownerBulkSubmissionAfterKeyCount - 1n);
            
            // Confirm the pool bulk submission keyCount increased by 1
            const poolBulkSubmissionAfterStake = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            const poolBulkSubmissionAfterStakeKeyCount = poolBulkSubmissionAfterStake[2];
            expect(poolBulkSubmissionAfterStakeKeyCount).to.equal(poolBulkSubmissionAfterKeyCount + 1n);     
        });

        it("Check that an existing pool submission's stakedKyCount increases when an un-submitted key is staked", async function () {
            const { poolFactory, addr1, addr2, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

            // Mint Node Licenses
            const addr1MintedKeyIds = await mintBatchedLicenses(100n, nodeLicense, addr1);
            const addr2MintedKeyId = await mintSingleLicense(nodeLicense, addr2);

            const challengeId = 0;
			const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";

            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

            // Submit First challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

            // Create a pool
            const stakingPoolAddress = await createPool(poolFactory, addr1, addr1MintedKeyIds);

            // Make sure the challenge is open for submissions
            const { openForSubmissions } = await referee.getChallenge(challengeId);            
            expect(openForSubmissions).to.equal(true);

            // Submit a pool assertion for first challenge
            await referee.connect(addr1).submitBulkAssertion(stakingPoolAddress, challengeId, stateRoot);

            // Confirm pool submission was created and key counts are correct
            const bulkSubmission = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            const submittedBefore = bulkSubmission[0];
            const claimedBefore = bulkSubmission[1];
            const keyCountBefore = bulkSubmission[2];
            expect(keyCountBefore).to.equal(100);
            expect(submittedBefore).to.equal(true);
            expect(claimedBefore).to.equal(false);

            // User stakes not submitted keyID into pool
            await poolFactory.connect(addr2).stakeKeys(
                stakingPoolAddress,
                [addr2MintedKeyId]
            );
            
            const bulkSubmissionAfterStake = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            const submitted = bulkSubmissionAfterStake[0];
            const claimed = bulkSubmissionAfterStake[1];
            const keyCount = bulkSubmissionAfterStake[2];

            // Confirm pool submission was updated and key count was increased
            expect(keyCount).to.equal(101);
            expect(submitted).to.equal(true);
            expect(claimed).to.equal(false);
        });
        
        it("Check that an existing bulkSubmission's keyCount decreases upon the un-staking of a key & that key can then submit and claim.", async function () {
            const { poolFactory, addr1:poolOwner, addr2: keyOwner, nodeLicense, referee, esXai, esXaiMinter, challenger } = await loadFixture(deployInfrastructure);

            // Mint keys for addr1
            const addr1MintedKeyId = await mintSingleLicense(nodeLicense, poolOwner);
            
            // Have to mint a lot of keys to ensure we have winners in both pool submissions and individual key submissions
            const keysToMintForAddr2 = 200n;

            // Count backwards from the last minted keyId to get the keyIds to stake in the pool
			const addr2MintedKeyIds = await mintBatchedLicenses(keysToMintForAddr2, nodeLicense, keyOwner);

            const challengeId = 0;
            const winningKeys = [addr2MintedKeyIds[0]];
			const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";

            // Submit a challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

            // Create a pool with the newly minted key
            const stakingPoolAddress = await createPool(poolFactory, poolOwner, [addr1MintedKeyId]);

            // Confirm the pool has 1 staked key
            expect(await referee.assignedKeysToPoolCount(stakingPoolAddress)).to.equal(1);
            
            // Stake key into pool to later check the keyCount after unstake 
            // Pool should now have 1 staked key prior to first pool assertion             
            // split the addr2MintedKeyIds array into 2 arrays of 100 keys each
            const slice1 = addr2MintedKeyIds.slice(0, 100);
            const slice2 = addr2MintedKeyIds.slice(100, 200);

            await poolFactory.connect(keyOwner).stakeKeys(
                stakingPoolAddress,
                slice1
            );
            await poolFactory.connect(keyOwner).stakeKeys(
                stakingPoolAddress,
                slice2
            );
            // Confirm the pool has 251 staked keys
            expect(await referee.assignedKeysToPoolCount(stakingPoolAddress)).to.equal(201);

            // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
            await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 10_000_000);

            // Immediately request unstake of key
            // Successfully create un-stake request for 1 key
			await poolFactory.connect(keyOwner).createUnstakeKeyRequest(stakingPoolAddress, 100);

            // Wait 8 days
            const duration = 60 * 60 * 24 * 8; // 8 days
            await ethers.provider.send("evm_increaseTime", [duration]);
            await ethers.provider.send("evm_mine");

            // Submit a pool bulk assertion while both keys are staked
            await referee.connect(poolOwner).submitBulkAssertion(stakingPoolAddress, challengeId, stateRoot);
            // Get bulkSubmission after bulkAssertion to check the keyCount
            const poolBulkSubmissionBeforeUnstake = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(poolBulkSubmissionBeforeUnstake.keyCount).to.equal(201);
            expect(poolBulkSubmissionBeforeUnstake.submitted).to.equal(true);
            expect(poolBulkSubmissionBeforeUnstake.claimed).to.equal(false);

            // Confirm owner's unstaked key count
            const keyOwnersKeyBalance = await nodeLicense.balanceOf(keyOwner.address);
            const keyOwnersStakedKeyCountBefore = await referee.assignedKeysOfUserCount(keyOwner.address);
            const ownerUnstakedKeyCountBefore = keyOwnersKeyBalance - keyOwnersStakedKeyCountBefore;

            // Complete the unstake request after pool assertion has been submitted
            await poolFactory.connect(keyOwner).unstakeKeys(stakingPoolAddress, 0, slice2);

            // Confirm owner's unstaked key count after unstake
            const keyOwnersStakedKeyCountAfter = await referee.assignedKeysOfUserCount(keyOwner.address);
            const ownerUnstakedKeyCountAfter = keyOwnersKeyBalance - keyOwnersStakedKeyCountAfter;
            expect(ownerUnstakedKeyCountAfter).to.equal(ownerUnstakedKeyCountBefore + 100n);
            
            // Confirm the pool's existing bulkSubmission's keyCount is updated after unstake
            const poolBulkSubmissionAfterUnstake = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
            expect(poolBulkSubmissionAfterUnstake.keyCount).to.equal(101);
            expect(poolBulkSubmissionAfterUnstake.submitted).to.equal(true);
            expect(poolBulkSubmissionAfterUnstake.claimed).to.equal(false);
            
            // Submit assertion for un-staked key to check if possible for owner to submit an assertion
            await referee.connect(keyOwner).submitBulkAssertion(keyOwner.address, challengeId, stateRoot);

            // Confirm the owner bulk submission was created and the key count is correct
			const ownerBulkSubmission = await referee.bulkSubmissions(challengeId, keyOwner.address);
            const ownerBulkSubmissionSubmitted = ownerBulkSubmission[0];
            const ownerBulkSubmissionKeyCount = ownerBulkSubmission[2];
            expect(ownerBulkSubmissionSubmitted).to.equal(true);
            expect(ownerBulkSubmissionKeyCount).to.equal(110n);

            // Create a new challenge to make the previous one claimable
            const assertion2 = startingAssertion + 1;
            await submitTestChallenge(referee, challenger, assertion2, stateRoot);            

            // Get Pool & User Balances Before Claim
            const poolBalanceBeforeClaim = await esXai.connect(keyOwner).balanceOf(stakingPoolAddress);
            expect(poolBalanceBeforeClaim).to.equal(0);
            const userBalanceBeforeClaim = await esXai.connect(keyOwner).balanceOf(await keyOwner.getAddress());
            expect(userBalanceBeforeClaim).to.equal(0);
            
            // Claim the rewards for a pool
            await referee.connect(poolOwner).claimBulkRewards(stakingPoolAddress, challengeId);

            // Get the pool submission after the claim
            const poolBulkSubmissionAfterClaim = await referee.bulkSubmissions(challengeId, stakingPoolAddress);

            // Confirm the pool submission was claimed
            expect(poolBulkSubmissionAfterClaim.claimed).to.equal(true);

            // Confirm the pool & user balances after the pool bulk claim
            const poolBalanceAfterClaim = await esXai.connect(keyOwner).balanceOf(stakingPoolAddress);
            const userBalanceAfterPoolClaim = await esXai.connect(keyOwner).balanceOf(await keyOwner.getAddress());

            // Confirm the pool balance increased and the user balance did not
            expect(poolBalanceAfterClaim).to.be.greaterThan(poolBalanceBeforeClaim);
            expect(userBalanceAfterPoolClaim).to.equal(0);            

            // Claim the rewards for the user
            await referee.connect(keyOwner).claimBulkRewards(keyOwner.address, challengeId);            

            // Get user and pool balances after owner bulk claim
            const userBalanceAfterClaim = await esXai.connect(keyOwner).balanceOf(await keyOwner.getAddress());
            const poolBalanceAfterUserClaim = await esXai.connect(keyOwner).balanceOf(stakingPoolAddress);

            // Confirm the user balance increased after individual key claim and the pool balance did not
            expect(poolBalanceAfterUserClaim).to.equal(poolBalanceAfterClaim);
            expect(userBalanceAfterClaim).to.be.greaterThan(userBalanceBeforeClaim);
            
            // Get the user bulk submission after the user claim
            const ownerSubmissionAfterClaim = await referee.bulkSubmissions(challengeId, keyOwner.address);
            
            // Confirm the user bulk submission was claimed
            const ownerBulkSubmissionClaimed = ownerSubmissionAfterClaim[1];
            expect(ownerBulkSubmissionClaimed).to.equal(true);

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
        const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";

        // Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
        await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);

        // Submit two challenges so that the contract tests will run successfully
        const startingAssertion = 100;
        
        //Start Initial Challenge Period for Challenge 0
        await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

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
        await referee.connect(addr1).submitBulkAssertion(stakingPoolAddress, challengeId, stateRoot);

        // Confirm that the bulkSubmission was created and the staked key count is correct
        const bulkSubmissionAfter = await referee.bulkSubmissions(challengeId, stakingPoolAddress);
        expect(bulkSubmissionAfter.submitted).to.equal(true);
        expect(bulkSubmissionAfter.keyCount).to.equal(keysToMintForAddr1);
        
        // Make sure the staking pool has no balance yet
        const poolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
        expect(poolBalance).to.equal(0);

        // Submit a new challenge to make the previous one claimable
        const startingAssertion2 = startingAssertion + 1;
        
        await submitTestChallenge(referee, challenger, startingAssertion2, stateRoot);
        
        // Claim the rewards for a pool
        await referee.connect(addr1).claimBulkRewards(stakingPoolAddress, challengeId);
        
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
        const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
        await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

        // Create a pool with addr1 as the owner and addr2 as the delegate
        const poolAddress = await createPool(poolFactory, poolOwner, licenseIds, poolDelegate);
        
        // Confirm address2 is the delegate for the pool
        const delegatePoolAddress = await poolFactory.poolsOfDelegate(poolDelegate, 0);
        expect(delegatePoolAddress).to.equal(poolAddress);

        // Submit a pool assertion with address2
        await referee.connect(poolDelegate).submitBulkAssertion(poolAddress, challengeId, stateRoot);

        // Confirm the pool submission was created and the staked key count is correct
        const bulkSubmission = await referee.bulkSubmissions(challengeId, poolAddress);
        expect(bulkSubmission.keyCount).to.equal(100);
        expect(bulkSubmission.submitted).to.equal(true);
        expect(bulkSubmission.claimed).to.equal(false);

        // Submit new challenge to make the previous one claimable
        const startingAssertion2 = startingAssertion + 1;
        await submitTestChallenge(referee, challenger, startingAssertion2, stateRoot);
        
        //Confirm pool balances before claim
        const poolBalanceBeforeClaim = await esXai.connect(esXaiMinter).balanceOf(poolAddress);
        expect(poolBalanceBeforeClaim).to.equal(0);

        // Submit a pool claim with address2
        await referee.connect(poolDelegate).claimBulkRewards(poolAddress, challengeId);

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
        const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
        await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

        // Create a pool with addr1 as the owner
        const poolAddress = await createPool(poolFactory, poolOwner, licenseIds);

        // Stake keys for addr2
        await poolFactory.connect(keyStaker).stakeKeys(poolAddress, licenseIds2);

        // Submit a pool assertion with addr2
        await referee.connect(keyStaker).submitBulkAssertion(poolAddress, challengeId, stateRoot);

        // Confirm the pool submission was created and the staked key count is correct
        const bulkSubmission = await referee.bulkSubmissions(challengeId, poolAddress);
        expect(bulkSubmission.keyCount).to.equal(200);
        expect(bulkSubmission.submitted).to.equal(true);
        expect(bulkSubmission.claimed).to.equal(false);

        // Submit a new challenge to make the previous one claimable
        const startingAssertion2 = startingAssertion + 1;
        await submitTestChallenge(referee, challenger, startingAssertion2, stateRoot);


        // Check the pool balance before the claim
        const poolBalanceBeforeClaim = await esXai.connect(esXaiMinter).balanceOf(poolAddress);
        expect(poolBalanceBeforeClaim).to.equal(0);
        
        // Submit a pool claim with addr2
        await referee.connect(keyStaker).claimBulkRewards(poolAddress, challengeId);

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
        const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
        await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

        // Create a pool with addr1 as the owner
        const poolAddress = await createPool(poolFactory, poolOwner, licenseIds);
        
        // Mint some esXai for addr2
        await esXai.connect(esXaiMinter).mint(await esXaiStaker.getAddress(), 100_000);

        // Stake esXai for addr2
        await esXai.connect(esXaiStaker).approve(poolFactory, 10_000_000);
        await poolFactory.connect(esXaiStaker).stakeEsXai(poolAddress, 10_000_000);        
        
        // Submit a pool assertion with addr2
        await referee.connect(esXaiStaker).submitBulkAssertion(poolAddress, challengeId, stateRoot);
        
        // Confirm the pool submission was created and the staked key count is correct
        const bulkSubmission = await referee.bulkSubmissions(challengeId, poolAddress);
        expect(bulkSubmission.keyCount).to.equal(100);
        expect(bulkSubmission.submitted).to.equal(true);
        expect(bulkSubmission.claimed).to.equal(false);

        // Submit a new challenge to make the previous one claimable
        const startingAssertion2 = startingAssertion + 1;
        await submitTestChallenge(referee, challenger, startingAssertion2, stateRoot);
        
        // Check the pool balance before the claim
        const poolBalanceBeforeClaim = await esXai.connect(esXaiMinter).balanceOf(poolAddress);
        expect(poolBalanceBeforeClaim).to.equal(0);

        // Submit a pool claim with addr2
        await referee.connect(esXaiStaker).claimBulkRewards(poolAddress, challengeId);

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
        const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
        await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

        // Create a pool with addr1 as the owner
        const poolAddress = await createPool(poolFactory, poolOwner, licenseIds);

        // Submit a pool assertion with addr2
        await expect(referee.connect(nonOwner).submitBulkAssertion(poolAddress, challengeId, stateRoot)).to.be.revertedWith("17");

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
