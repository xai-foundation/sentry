import { expect, assert } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

export function RefereeTests(deployInfrastructure) {
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
                publicKeyHex
            );

            // Submit the second challenge
            await referee.connect(challenger).submitChallenge(
                101,
                100,
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                0,
                publicKeyHex
            );

            const finalChallengeCounter = await referee.challengeCounter();
            const previousChallenge = await referee.getChallenge(initialChallengeCounter);

            // Check that the challenge counter has increased by 2
            assert.equal(finalChallengeCounter, initialChallengeCounter + BigInt(2), "The challenge counter did not increase correctly");

            // Check that the previous challenge is closed
            assert.equal(previousChallenge.openForSubmissions, false, "The previous challenge did not close after submitting a new challenge");
        });


    }
}