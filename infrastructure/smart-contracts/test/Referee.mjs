import { expect, assert } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {winningHashForNodeLicense0} from "./AssertionData.mjs";

export function RefereeTests(deployInfrastructure) {

    /**
     * @notice Iterates over a range of state roots to find a winning state root.
     * @dev This function iterates over a range of state roots, creating an assertion hash for each one and checking if it is a winner.
     * A state root is considered a winner if the assertion hash is below the threshold for all node licenses.
     * The function will continue to iterate until a winning state root is found.
     * @param referee The referee contract instance.
     * @param winnerNodeLicenses An array of node licenses that are potential winners.
     * @param challengeId The ID of the challenge.
     * @return The winning state root.
     */
    async function findWinningStateRoot(referee, winnerNodeLicenses, challengeId) {
        for (let i = 0n;; i++) {
            const successorStateRoot = `0x${i.toString(16).padStart(64, '0')}`;
            let isWinnerForAll = true;
            for (const nodeLicenseId of winnerNodeLicenses) {
                const [isWinner] = await referee.createAssertionHashAndCheckPayout(nodeLicenseId, challengeId, successorStateRoot, "0x0000000000000000000000000000000000000000000000000000000000000000");
                if (!isWinner) {
                    isWinnerForAll = false;
                    break;
                }
            }
            if (isWinnerForAll) {
                return successorStateRoot;
            }
        }
    }

    return function() {

        it("Check to make sure the setChallengerPublicKey actually saves the value and only callable as an admin", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin, challenger} = await loadFixture(deployInfrastructure);
            const newPublicKey = "0x1234567890abcdef";
            await referee.connect(refereeDefaultAdmin).setChallengerPublicKey(newPublicKey);
            const savedPublicKey = await referee.challengerPublicKey();
            assert.equal(savedPublicKey, newPublicKey, "The saved public key does not match the new public key");
            const expectedRevertMessageAdmin = `AccessControl: account ${kycAdmin.address.toLowerCase()} is missing role ${await referee.DEFAULT_ADMIN_ROLE()}`;
            await expect(referee.connect(kycAdmin).setChallengerPublicKey(newPublicKey)).to.be.revertedWith(expectedRevertMessageAdmin);
            const expectedRevertMessageChallenger = `AccessControl: account ${challenger.address.toLowerCase()} is missing role ${await referee.DEFAULT_ADMIN_ROLE()}`;
            await expect(referee.connect(challenger).setChallengerPublicKey(newPublicKey)).to.be.revertedWith(expectedRevertMessageChallenger);
        })

        it("Check isApprovedForOperator function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const isApproved = await referee.isApprovedForOperator(refereeDefaultAdmin.address, kycAdmin.address);
            assert.equal(isApproved, true, "The operator is not approved");
        })

        it("Check setApprovalForOperator function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const isApproved = await referee.isApprovedForOperator(refereeDefaultAdmin.address, kycAdmin.address);
            assert.equal(isApproved, true, "The operator is not approved");
        })

        it("Check getOperatorAtIndex function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const operator = await referee.getOperatorAtIndex(refereeDefaultAdmin.address, 0);
            assert.equal(operator, kycAdmin.address, "The operator at index does not match");
        })

        it("Check getOperatorCount function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const count = await referee.getOperatorCount(refereeDefaultAdmin.address);
            assert.equal(count, BigInt(1), "The operator count does not match");
        })

        it("Check getOwnerForOperatorAtIndex function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const owner = await referee.getOwnerForOperatorAtIndex(kycAdmin.address, 0);
            assert.equal(owner, refereeDefaultAdmin.address, "The owner at index does not match");
        })

        it("Check getOwnerCountForOperator function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const count = await referee.getOwnerCountForOperator(kycAdmin.address);
            assert.equal(count, BigInt(1), "The owner count does not match");
        })

        it("Check addKycWallet function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
            const isApproved = await referee.isKycApproved(kycAdmin.address);
            assert.equal(isApproved, true, "The wallet is not KYC approved");
        })

        it("Check removeKycWallet function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
            await referee.connect(kycAdmin).removeKycWallet(kycAdmin.address);
            const isApproved = await referee.isKycApproved(kycAdmin.address);
            assert.equal(isApproved, false, "The wallet is still KYC approved");
        })

        it("Check isKycApproved function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
            const isApproved = await referee.isKycApproved(kycAdmin.address);
            assert.equal(isApproved, true, "The wallet is not KYC approved");
        })

        it("Check getKycWalletAtIndex function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
            const count = await referee.getKycWalletCount();
            const wallet = await referee.getKycWalletAtIndex(count - BigInt(1));
            assert.equal(wallet, kycAdmin.address, "The wallet at index does not match");
        })

        it("Check getKycWalletCount function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
            const initialCount = await referee.getKycWalletCount();
            await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
            const finalCount = await referee.getKycWalletCount();
            assert.equal(finalCount, BigInt(initialCount + BigInt(1)), "The KYC wallet count does not match");
        })

        it("Check calculateChallengeEmissionAndTier function with increased total supply", async function() {
            const {referee, xai, xaiMinter} = await loadFixture(deployInfrastructure);
            const maxSupply = await xai.MAX_SUPPLY();
    

            let previousEmissionAndTier = await referee.calculateChallengeEmissionAndTier();
            let currentSupply = await referee.getCombinedTotalSupply();
            let currentTier = maxSupply / BigInt(2);
            let iterationCount = 0;
        
            while(currentSupply < maxSupply && iterationCount < 29) {
                // Calculate the amount to mint to reach the next tier
                let mintAmount = currentTier - currentSupply;
        
                // Break out of the loop if mint amount is 0
                if (mintAmount === BigInt(0)) {
                    break;
                }
        
                // Mint the calculated amount
                await xai.connect(xaiMinter).mint(xaiMinter.address, mintAmount);
        
                // Update the current supply
                currentSupply = await referee.getCombinedTotalSupply();
        
                // Check that the emission and tier have changed
                const currentEmissionAndTier = await referee.calculateChallengeEmissionAndTier();
                assert.notDeepEqual(previousEmissionAndTier, currentEmissionAndTier, "The emission and tier did not change after increasing total supply");
                previousEmissionAndTier = currentEmissionAndTier;
        
                // Calculate the next tier
                currentTier = currentSupply + (mintAmount / BigInt(2));
                
                // Increase iteration count
                iterationCount++;
            }
        })

        it("Check submitChallenge function", async function() {
            const {referee, challenger, xai, esXai, publicKeyHex} = await loadFixture(deployInfrastructure);
            const maxSupply = await xai.MAX_SUPPLY();
            const initialChallengeCounter = await referee.challengeCounter();
            const initialTotalSupply = await referee.getCombinedTotalSupply();
            const initialAllocatedTokens = initialTotalSupply - (await xai.totalSupply() + await esXai.totalSupply());
            const initialGasSubsidyRecipientBalance = await xai.balanceOf(referee.gasSubsidyRecipient());
            const [challengeMintAmount] = await referee.calculateChallengeEmissionAndTier();

            // Submit a challenge
            await referee.connect(challenger).submitChallenge(
                100,
                99,
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                0,
                publicKeyHex
            );

            const finalChallengeCounter = await referee.challengeCounter();
            const finalTotalSupply = await referee.getCombinedTotalSupply();
            const finalAllocatedTokens = finalTotalSupply - (await xai.totalSupply() + await esXai.totalSupply());
            const finalGasSubsidyRecipientBalance = await xai.balanceOf(referee.gasSubsidyRecipient());

            // Check that the challenge counter has increased
            assert.equal(finalChallengeCounter, initialChallengeCounter + BigInt(1), "The challenge counter did not increase");

            // Check that the total supply has increased
            assert.equal(finalTotalSupply, initialTotalSupply + challengeMintAmount, "The total supply did not increase");

            // Check that the allocated tokens have increased
            assert.equal(finalAllocatedTokens, initialAllocatedTokens + challengeMintAmount - (challengeMintAmount * BigInt(15) / BigInt(100)), "The allocated tokens did not increase");

            // Check that the gas subsidy recipient's balance has increased
            assert.equal(finalGasSubsidyRecipientBalance, initialGasSubsidyRecipientBalance + (challengeMintAmount * BigInt(15) / BigInt(100)), "The gas subsidy recipient's balance did not increase");
        })

        it("Check that submitting a second challenge will close the previous challenge", async function() {
            const {referee, challenger, publicKeyHex} = await loadFixture(deployInfrastructure);
            const initialChallengeCounter = await referee.challengeCounter();

            // Submit the first challenge
            await referee.connect(challenger).submitChallenge(
                100,
                99,
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                0,
                "0x0000000000000000000000000000000000000000000000000000000000000000"
            );

            // Submit the second challenge
            await referee.connect(challenger).submitChallenge(
                101,
                100,
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                0,
                "0x0000000000000000000000000000000000000000000000000000000000000000"
            );

            const finalChallengeCounter = await referee.challengeCounter();
            const previousChallenge = await referee.getChallenge(initialChallengeCounter);

            // Check that the challenge counter has increased by 2
            assert.equal(finalChallengeCounter, initialChallengeCounter + BigInt(2), "The challenge counter did not increase correctly");

            // Check that the previous challenge is closed
            assert.equal(previousChallenge.openForSubmissions, false, "The previous challenge did not close after submitting a new challenge");
        });

        it("Check that addr1 submitting a winning hash receives the allocated reward", async function() {
            const {referee, operator, challenger, esXai, addr1} = await loadFixture(deployInfrastructure);

            const winningStateRoot = await findWinningStateRoot(referee, [1], 0);

            // Submit a challenge
            await referee.connect(challenger).submitChallenge(
                100,
                99,
                winningStateRoot,
                0,
                "0x0000000000000000000000000000000000000000000000000000000000000000"
            );

            // check to see the challenge is open for submissions
            const {openForSubmissions} = await referee.getChallenge(0);
            expect(openForSubmissions).to.be.eq(true);
            

            // Submit a winning hash
            await referee.connect(operator).submitAssertionToChallenge(1, 0, winningStateRoot);

            // Check the submission
            const submission = await referee.getSubmissionsForChallenges([0], 1);
            assert.equal(submission[0].submitted, true, "The submission was not submitted");
            assert.equal(submission[0].claimed, false, "The submission was already claimed");
            assert.equal(submission[0].eligibleForPayout, true, "The hash was not eligible for a payout");

            // submit another assertion to end the previous challenge
            await referee.connect(challenger).submitChallenge(
                101,
                100,
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                0,
                "0x0000000000000000000000000000000000000000000000000000000000000000"
            );

            // check to see the previous challenge closed
            const {openForSubmissions: openForSubmissionsAfter, numberOfEligibleClaimers, rewardAmountForClaimers} = await referee.getChallenge(0);
            expect(openForSubmissionsAfter).to.be.eq(false);
            expect(numberOfEligibleClaimers).to.be.eq(BigInt(1));

            // get the esXai balance of the addr1 prior to claiming
            const balanceBefore = await esXai.balanceOf(await addr1.getAddress());

            // Claim the reward
            await referee.connect(operator).claimReward(1, 0);

            // Check the submission again to see its now claimed
            const claimedSubmission = await referee.getSubmissionsForChallenges([0], 1);
            assert.equal(claimedSubmission[0].claimed, true, "The reward was not claimed");

            // check to see we got all the rewards from the claim
            const balanceAfter = await esXai.balanceOf(await addr1.getAddress());
            assert.equal(balanceAfter, balanceBefore + rewardAmountForClaimers, "The amount of esXai minted was wrong")

            // check the esxai balance is equal to the total claims for the node owner
            const totalClaimsForAddr1 = await referee.getTotalClaims(await addr1.getAddress());
            assert.equal(totalClaimsForAddr1, balanceAfter, "total claims does not match the esXai value")
        });
    }
}