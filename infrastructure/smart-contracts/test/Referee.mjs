import {expect, assert} from "chai";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {winningHashForNodeLicense0} from "./AssertionData.mjs";
import {Contract} from "ethers";
import {submitTestChallenge} from "./utils/submitTestChallenge.mjs";
import { createMockRollupNodes, confirmMockRollupNodes } from "./utils/mockRollupHelpers.mjs";
import {submitMockRollupChallenge} from "./utils/submitMockRollupChallenge.mjs";
import {mintBatchedLicenses, mintSingleLicense} from "./utils/mintLicenses.mjs";
import {createPool} from "./utils/createPool.mjs";

export 	async function getStateRoots(count) {
	let results = [];
	for (let i = 0n; i < count; i++) {
		const successorStateRoot = `0x${i.toString(16).padStart(64, '0')}`;
		results.push(successorStateRoot);
	}
	return results;
}

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
export async function findWinningStateRoot(referee, winnerNodeLicenses, challengeId, boostFactor = 100) {
	for (let i = 0n; ; i++) {
		const successorStateRoot = `0x${i.toString(16).padStart(64, '0')}`;
		let isWinnerForAll = true;
		for (const nodeLicenseId of winnerNodeLicenses) {
			const [isWinner] = await referee.createAssertionHashAndCheckPayout(nodeLicenseId, challengeId, boostFactor, successorStateRoot, "0x0000000000000000000000000000000000000000000000000000000000000000");
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

const setupRefereeForMockupRollup = async (referee, mockRollup) => {
	const slotIndexRollupAddress = 202; // Referee storage slot for rollupAddress
	const slotIndexIsCheckingAssertions = 210; // Referee storage slot for rollupAddress

	const rollupValue = ethers.zeroPadValue(await mockRollup.getAddress(), 32);
	await ethers.provider.send("hardhat_setStorageAt", [
		referee.target,
		ethers.toQuantity(slotIndexRollupAddress),
		rollupValue,
	]);
	const isCheckingAssertionsValue = ethers.zeroPadValue("0x01", 32);
	await ethers.provider.send("hardhat_setStorageAt", [
		referee.target,
		ethers.toQuantity(slotIndexIsCheckingAssertions),
		isCheckingAssertionsValue,
	]);
}


export function RefereeTests(deployInfrastructure) {

	const getLocalAssertionHashAndCheck = (nodeLicenseId, challengeId, boostFactor, confirmData, challengerSignedHash) => {
		const assertionHash = ethers.keccak256(ethers.solidityPacked(["uint256", "uint256", "bytes", "bytes"], [nodeLicenseId, challengeId, confirmData, challengerSignedHash]));
		let hashNumber = BigInt(assertionHash);
		return [Number((hashNumber % BigInt(10000))) < boostFactor, assertionHash];
	}

	function getNumWinningStateRoots(numIterations, boostFactor) {
		let numWinners = 0;
		for (let i = 0n; i < numIterations; i++) {
			const successorStateRoot = `0x${i.toString(16).padStart(64, '0')}`;
			const [isWinner] = getLocalAssertionHashAndCheck(1n, 1n, boostFactor, successorStateRoot, "0x0000000000000000000000000000000000000000000000000000000000000000");
			if (isWinner) {
				numWinners++;
			}
		}
		return numWinners;
	}

	return function () {

		// With Referee version 9 we removed the setChallengerPublicKey function for contract size savings. The publickey would be updated with an upgrade initialize
		// it("Check to make sure the setChallengerPublicKey actually saves the value and only callable as an admin", async function () {
		// 	const {referee, refereeDefaultAdmin, kycAdmin, challenger} = await loadFixture(deployInfrastructure);
		// 	const newPublicKey = "0x1234567890abcdef";
		// 	await referee.connect(refereeDefaultAdmin).setChallengerPublicKey(newPublicKey);
		// 	const savedPublicKey = await referee.challengerPublicKey();
		// 	assert.equal(savedPublicKey, newPublicKey, "The saved public key does not match the new public key");
		// 	const expectedRevertMessageAdmin = `AccessControl: account ${kycAdmin.address.toLowerCase()} is missing role ${await referee.DEFAULT_ADMIN_ROLE()}`;
		// 	await expect(referee.connect(kycAdmin).setChallengerPublicKey(newPublicKey)).to.be.revertedWith(expectedRevertMessageAdmin);
		// 	const expectedRevertMessageChallenger = `AccessControl: account ${challenger.address.toLowerCase()} is missing role ${await referee.DEFAULT_ADMIN_ROLE()}`;
		// 	await expect(referee.connect(challenger).setChallengerPublicKey(newPublicKey)).to.be.revertedWith(expectedRevertMessageChallenger);
		// })

		it("Check isApprovedForOperator function", async function () {
			const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
			await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
			const isApproved = await referee.isApprovedForOperator(refereeDefaultAdmin.address, kycAdmin.address);
			assert.equal(isApproved, true, "The operator is not approved");
		})

		it("Check setApprovalForOperator function", async function () {
			const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
			await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
			let isApproved = await referee.isApprovedForOperator(refereeDefaultAdmin.address, kycAdmin.address);
			assert.equal(isApproved, true, "The operator is not approved");
			await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, false);
			isApproved = await referee.isApprovedForOperator(refereeDefaultAdmin.address, kycAdmin.address);
			assert.equal(isApproved, false, "The operator is still approved");
		})

		it("Check getOperatorAtIndex function", async function () {
			const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
			await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
			const operator = await referee.getOperatorAtIndex(refereeDefaultAdmin.address, 0);
			assert.equal(operator, kycAdmin.address, "The operator at index does not match");
		})

		it("Check getOperatorCount function", async function () {
			const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
			await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
			const count = await referee.getOperatorCount(refereeDefaultAdmin.address);
			assert.equal(count, BigInt(1), "The operator count does not match");
		})

		it("Check getOwnerForOperatorAtIndex function", async function () {
			const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
			await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
			const owner = await referee.getOwnerForOperatorAtIndex(kycAdmin.address, 0);
			assert.equal(owner, refereeDefaultAdmin.address, "The owner at index does not match");
		})

		it("Check getOwnerCountForOperator function", async function () {
			const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
			await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
			const count = await referee.getOwnerCountForOperator(kycAdmin.address);
			assert.equal(count, BigInt(1), "The owner count does not match");
		})

		it("Check addKycWallet function", async function () {
			const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
			await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
			const isApproved = await referee.isKycApproved(kycAdmin.address);
			assert.equal(isApproved, true, "The wallet is not KYC approved");
		})

		it("Check removeKycWallet function", async function () {
			const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
			await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
			await referee.connect(kycAdmin).removeKycWallet(kycAdmin.address);
			const isApproved = await referee.isKycApproved(kycAdmin.address);
			assert.equal(isApproved, false, "The wallet is still KYC approved");
		})

		it("Check isKycApproved function", async function () {
			const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
			await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
			const isApproved = await referee.isKycApproved(kycAdmin.address);
			assert.equal(isApproved, true, "The wallet is not KYC approved");
		})

		it("Check getKycWalletAtIndex function", async function () {
			const {referee, refereeDefaultAdmin, kycAdmin} = await loadFixture(deployInfrastructure);
			await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
			const count = await referee.getKycWalletCount();
			const wallet = await referee.getKycWalletAtIndex(count - BigInt(1));
			assert.equal(wallet, kycAdmin.address, "The wallet at index does not match");
		})

		it("Check getKycWalletCount function", async function () {
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

		    while(currentSupply < maxSupply && iterationCount < 23) {
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

		it("Check calculateChallengeEmissionAndTier", async function () {
			const {referee, xai, xaiMinter} = await loadFixture(deployInfrastructure);
			const maxSupply = await xai.MAX_SUPPLY();

			let tokensToMint = [ethers.parseEther('1250000000')];
			for (let i = 0; i < 22; i++) {
				tokensToMint.push(tokensToMint[i] / BigInt(2));
			}

			let challengeAllocations = [BigInt('71347031963470319634703')];
			for (let i = 0; i < 22; i++) {
				challengeAllocations.push(challengeAllocations[i] / BigInt(2));
			}

			let calculatedChallengeAllocations = [];
			let calculatedThresholds = [];
			let totalSupplies = [];
			await xai.connect(xaiMinter).mint(xaiMinter.address, 1);
			for (let i = 0; i < tokensToMint.length; i++) {

				// calculate the ChallengeEmissionAndTier
				const [_challengeAllocation, threshold] = await referee.calculateChallengeEmissionAndTier();
				const totalSupply = await referee.getCombinedTotalSupply();
				calculatedChallengeAllocations.push(_challengeAllocation);
				calculatedThresholds.push(threshold);
				totalSupplies.push(totalSupply);


				// mint the tokens to get to the next tier
				await xai.connect(xaiMinter).mint(xaiMinter.address, tokensToMint[i]);
			}

			// for (let i = 0; i < calculatedChallengeAllocations.length; i++) {
			// 	console.log(i, totalSupplies[i], calculatedThresholds[i], calculatedChallengeAllocations[i]);
			// }

			// compare the entire arrays
			expect(calculatedChallengeAllocations).to.deep.equal(challengeAllocations);
			expect(calculatedThresholds).to.deep.equal(tokensToMint);
		})

		it("Check calculateChallengeEmissionAndTier with a variance", async function () {
			const {referee, xai, xaiMinter} = await loadFixture(deployInfrastructure);
			this.timeout(1000 * 60 * 20);
			const maxSupply = await xai.MAX_SUPPLY();

			let tokensToMint = [ethers.parseEther('1250000000')];
			for (let i = 0; i < 22; i++) {
				tokensToMint.push(tokensToMint[i] / BigInt(2));
			}

			let challengeAllocations = [BigInt('71347031963470319634703')];
			for (let i = 0; i < 22; i++) {
				challengeAllocations.push(challengeAllocations[i] / BigInt(2));
			}

			for (let i = 0; i < tokensToMint.length; i++) {

				const amountInTier = tokensToMint[i];
				const challengeAllocation = challengeAllocations[i];
				const variance = BigInt(200);
				const mintAmount = amountInTier / variance;

				for (let k = 0; k < variance; k++) {

					// console.log(i, k, mintAmount * (variance - BigInt(k)))

					// check the current variance
					const [_challengeAllocation, threshold] = await referee.calculateChallengeEmissionAndTier();
					expect(_challengeAllocation).to.be.eq(challengeAllocation);
					expect(threshold).to.be.eq(amountInTier);

					// mint the tokens to get to the next tier
					await xai.connect(xaiMinter).mint(xaiMinter.address, mintAmount);

				}

			}
		})

		it("Check submitChallenge function", async function () {
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

		it("Check that submitting a second challenge will close the previous challenge", async function () {
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

		it("Check that addr1 submitting a winning hash receives the allocated reward", async function () {
			const {referee, operator, challenger, esXai, addr1, nodeLicense} = await loadFixture(deployInfrastructure);

			// Mint 200 licenses so that a reward will be most likely guaranteed
			let keysToMint = 20000;
			await mintBatchedLicenses(keysToMint, nodeLicense, addr1);

			// Submit a challenge
			await referee.connect(challenger).submitChallenge(
				100,
				99,
				"0x0000000000000000000000000000000000000000000000000000000000000000",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);

			// check to see the challenge is open for submissions
			const {openForSubmissions} = await referee.getChallenge(0);
			expect(openForSubmissions).to.be.eq(true);

			// Submit a bulk assertion
			await referee.connect(operator).submitBulkAssertion(addr1.address, 0, "0x0000000000000000000000000000000000000000000000000000000000000000");

			// Check the submission
			const submission = await referee.bulkSubmissions(0, await addr1.getAddress());
			assert.equal(submission[0], true, "The submission was not submitted");
			assert.equal(submission[1], false, "The submission was already claimed");
			const winningKeyCount = submission[3];
			expect(winningKeyCount).to.be.gt(0);

			// submit another assertion to end the previous challenge
			await referee.connect(challenger).submitChallenge(
				101,
				100,
				"0x0000000000000000000000000000000000000000000000000000000000000001",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);

			// check to see the previous challenge closed
			const {
				openForSubmissions: openForSubmissionsAfter,
				numberOfEligibleClaimers,
				rewardAmountForClaimers
			} = await referee.getChallenge(0);
			expect(openForSubmissionsAfter).to.be.eq(false);
			expect(numberOfEligibleClaimers).to.be.gt(BigInt(0));

			// get the esXai balance of the addr1 prior to claiming
			const balanceBefore = await esXai.balanceOf(await addr1.getAddress());

			// Claim the reward
			await referee.connect(operator).claimBulkRewards(await addr1.getAddress(), 0);

			// Check the submission again to see its now claimed
			const claimedSubmission = await referee.bulkSubmissions(0, await addr1.getAddress());
			assert.equal(claimedSubmission[1], true, "The reward was not claimed");

			// check to see we got all the rewards from the claim
			const balanceAfter = await esXai.balanceOf(await addr1.getAddress());
			assert.equal(balanceAfter, balanceBefore + rewardAmountForClaimers, "The amount of esXai minted was wrong")

			// check the esxai balance is equal to the total claims for the node owner
			const totalClaimsForAddr1 = await referee._lifetimeClaims(await addr1.getAddress());
			assert.equal(totalClaimsForAddr1, balanceAfter, "total claims does not match the esXai value")

			// check getChallenge is able to iterate over both challenges
			const firstChallenge = await referee.getChallenge(0);
			const secondChallenge = await referee.getChallenge(1);
			assert.equal(firstChallenge.openForSubmissions, false, "First challenge is still open for submissions");
			assert.equal(secondChallenge.openForSubmissions, true, "Second challenge is not open for submissions");
		});

		it("Check that an assertion for a challenge, can't be submitted more than once", async function () {
			const {referee, challenger} = await loadFixture(deployInfrastructure);

			// Submit the same challenge twice
			await referee.connect(challenger).submitChallenge(
				101,
				100,
				"0x0000000000000000000000000000000000000000000000000000000000000001",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);

			await expect(
				referee.connect(challenger).submitChallenge(
					101,
					100,
					"0x0000000000000000000000000000000000000000000000000000000000000001",
					0,
					"0x0000000000000000000000000000000000000000000000000000000000000000"
				)
			).to.be.revertedWith("9");
		})

		it("Check that only a challenger can can submit a challenge", async function () {
			const {referee, operator, challenger} = await loadFixture(deployInfrastructure);
			const expectedRevertMessageChallenger = `AccessControl: account ${operator.address.toLowerCase()} is missing role ${await referee.CHALLENGER_ROLE()}`;

			// Attempt to submit a challenge as an operator, which should fail
			await expect(
				referee.connect(operator).submitChallenge(
					101,
					100,
					"0x0000000000000000000000000000000000000000000000000000000000000001",
					0,
					"0x0000000000000000000000000000000000000000000000000000000000000000"
				)
			).to.be.revertedWith(expectedRevertMessageChallenger);

			// Submit a challenge as a challenger, which should succeed
			await referee.connect(challenger).submitChallenge(
				101,
				100,
				"0x0000000000000000000000000000000000000000000000000000000000000001",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);
		})

		it("Check that rewards for a challenge can be expired", async function () {
			const {referee, operator, challenger} = await loadFixture(deployInfrastructure);

			// Submit a challenge
			await referee.connect(challenger).submitChallenge(
				101,
				100,
				"0x0000000000000000000000000000000000000000000000000000000000000001",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);

			// Attempt to expire the challenge rewards early
			await expect(
				referee.connect(operator).expireChallengeRewards(0)
			).to.be.revertedWith("29");

			// Fast forward time by 270 days
			await ethers.provider.send("evm_increaseTime", [23328000]);
			await ethers.provider.send("evm_mine");

			// Attempt to expire the challenge rewards
			await referee.connect(operator).expireChallengeRewards(0);

			// Check that the challenge is marked as expired
			const challenge = await referee.challenges(0);
			assert.equal(challenge.expiredForRewarding, true, "Challenge rewards were not expired");
		});

		it("Check that rewards for a challenge can be expired via claimReward", async function () {
			const {referee, operator, challenger} = await loadFixture(deployInfrastructure);

			// Submit a challenge
			await referee.connect(challenger).submitChallenge(
				101,
				100,
				"0x0000000000000000000000000000000000000000000000000000000000000001",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);

			// Close the challenge to allow claims by submitting the next challenge
			await referee.connect(challenger).submitChallenge(
				102,
				101,
				"0x0000000000000000000000000000000000000000000000000000000000000002",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);

			// Fast forward time by 270 days
			await ethers.provider.send("evm_increaseTime", [23328000]);
			await ethers.provider.send("evm_mine");

			// Attempt to claim reward, which should expire the challenge rewards
			await referee.connect(operator).claimReward(0, 0);

			// Check that the challenge is marked as expired
			const challenge = await referee.challenges(0);
			assert.equal(challenge.expiredForRewarding, true, "Challenge rewards were not expired via claimReward");
		});

		it("Check that submitting an invalid successorRoot does not create a submission", async function () {
			const {referee, operator, challenger, addr1} = await loadFixture(deployInfrastructure);

			// Submit a challenge
			await referee.connect(challenger).submitChallenge(
				101,
				100,
				"0x0000000000000000000000000000000000000000000000000000000000000001",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);

			
			// Submit a bulk assertion
			await referee.connect(operator).submitBulkAssertion(addr1.address, 0, "0x0000000000000000000000000000000000000000000000000000000000000002");
			
			// Check that no submission was created
			const submission = await referee.bulkSubmissions(0, await addr1.getAddress());			
			assert.equal(submission[0], false, "Submission was created with invalid successorRoot");
		});

		it("Check creating a node on mock rollup", async function () {
			const {referee, mockRollup} = await loadFixture(deployInfrastructure);

			await setupRefereeForMockupRollup(referee, mockRollup);
			assert.equal(await referee.rollupAddress(), await mockRollup.getAddress());
			assert.equal(await referee.isCheckingAssertions(), true);

			//create mock rollup nodes
			let currentAssertion = 2;
			let previousAssertion = 0;
			const createRes = await createMockRollupNodes(
				referee, 
				mockRollup,
				currentAssertion,
				previousAssertion
			);

			//assert trxs contain NodeCreated event
			for (let i = 0; i < createRes.transactions.length; i++) {
				let trxReceipt = await createRes.transactions[i].wait();
				assert.equal(trxReceipt.logs[0].fragment.name, "NodeCreated", "NodeCreated event not found");
			}
		});

		it("Check confirming a node on mock rollup", async function () {
			const {referee, mockRollup, refereeCalculations} = await loadFixture(deployInfrastructure);
			
			await setupRefereeForMockupRollup(referee, mockRollup);
			assert.equal(await referee.rollupAddress(), await mockRollup.getAddress());
			assert.equal(await referee.isCheckingAssertions(), true);

			//create mock rollup nodes
			let currentAssertion = 2;
			let previousAssertion = 0;
			const createRes = await createMockRollupNodes(
				referee, 
				mockRollup,
				currentAssertion,
				previousAssertion
			);

			//confirm mock rollup nodes
			let confirmRes = await confirmMockRollupNodes(
				referee,
				mockRollup,
				refereeCalculations,
				currentAssertion,
				previousAssertion
			);

			//assert transactions contain NodeConfirmed event
			for (let i = 0; i < confirmRes.transactions.length; i++) {
				let trxReceipt = await confirmRes.transactions[i].wait();
				let hexStr = "0x" + BigInt(i + 1).toString(16).padStart(64, "0");
				assert.equal(trxReceipt.logs[0].fragment.name, "NodeConfirmed", "NodeConfirmed event not found");
			    assert.equal(trxReceipt.logs[0].args[0], createRes.assertions[i], "nodeNum event param mismatch");
				assert.equal(trxReceipt.logs[0].args[1], hexStr, "blockHash event param mismatch");
			    assert.equal(trxReceipt.logs[0].args[2], hexStr, "sendRoot event param mismatch");
			}
		});

		it("Check submitting a test challenge to mock rollup contract", async function () {
			const {referee, challenger, mockRollup, refereeCalculations} = await loadFixture(deployInfrastructure);
			
			await setupRefereeForMockupRollup(referee, mockRollup);
			assert.equal(await referee.rollupAddress(), await mockRollup.getAddress());
			assert.equal(await referee.isCheckingAssertions(), true);
			
			let currentAssertion = 2;
			let previousAssertion = 0;
			const res = await submitMockRollupChallenge(
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				currentAssertion,
				previousAssertion,
				null,
				null
			);

			for (let i = 0; i < res.confirmData.length; i++) {
				assert.equal(res.confirmData[i], res.nodes[i][2], "confirmData mismatch");
			}
		});

		it("Check submitting a challenge with an invalid assertion block timestamp", async function () {
			const {referee, challenger, mockRollup, refereeCalculations} = await loadFixture(deployInfrastructure);
			
			await setupRefereeForMockupRollup(referee, mockRollup);
			assert.equal(await referee.rollupAddress(), await mockRollup.getAddress());
			assert.equal(await referee.isCheckingAssertions(), true);

			let currentAssertion = 2;
			let previousAssertion = 0;
			await expect(
				submitMockRollupChallenge(
					referee, 
					challenger, 
					mockRollup, 
					refereeCalculations, 
					currentAssertion,
					previousAssertion,
					null,
					10
				)
			).to.be.revertedWith("12");
		});

		it("Check failure to confirm node with wrong blockhash and sendroot", async function () {
			const {referee, challenger, mockRollup, refereeCalculations} = await loadFixture(deployInfrastructure);
			
			await setupRefereeForMockupRollup(referee, mockRollup);
			assert.equal(await referee.rollupAddress(), await mockRollup.getAddress());
			assert.equal(await referee.isCheckingAssertions(), true);
			
			//submit mock rollup challenge
			let currentAssertion = 2;
			let previousAssertion = 0;
			await submitMockRollupChallenge(
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				currentAssertion,
				previousAssertion,
				null,
				null
			);

			//attempt to confirm nodes
			for (let i = previousAssertion + 1; i <= currentAssertion; i++) {
				let badHexStr = "0x" + BigInt(i + 1).toString(16).padStart(64, "0");
				await expect(
				    mockRollup.confirmNode(
					    i,
						badHexStr,
						badHexStr
				    )
			    ).to.be.revertedWith("CONFIRM_DATA");
			}
		});

		it("Check failure to submit a challenge with a skipped previous assertion id", async function () {
			const {referee, challenger, mockRollup, refereeCalculations} = await loadFixture(deployInfrastructure);
			
			await setupRefereeForMockupRollup(referee, mockRollup);
			assert.equal(await referee.rollupAddress(), await mockRollup.getAddress());
			assert.equal(await referee.isCheckingAssertions(), true);
			
			let currentAssertion = 2;
			let previousAssertion = 1;
			await expect(
				submitMockRollupChallenge(
					referee, 
					challenger, 
					mockRollup, 
					refereeCalculations, 
					currentAssertion,
					previousAssertion,
					"0x0000000000000000000000000000000000000000000000000000000000000020",
					null
				)
			).to.be.revertedWith("10");
		});

		it("Check failure to submit a challenge with invalid confirmData", async function () {
			const {referee, challenger, mockRollup, refereeCalculations} = await loadFixture(deployInfrastructure);
			
			await setupRefereeForMockupRollup(referee, mockRollup);
			assert.equal(await referee.rollupAddress(), await mockRollup.getAddress());
			assert.equal(await referee.isCheckingAssertions(), true);
			
			let currentAssertion = 2;
			let previousAssertion = 0;
			await expect(
				submitMockRollupChallenge(
					referee, 
					challenger, 
					mockRollup, 
					refereeCalculations, 
					currentAssertion,
					previousAssertion,
					"0x0000000000000000000000000000000000000000000000000000000000000020",
					null
				)
			).to.be.revertedWith("11");
		});

		it("Check rewards calculations are correct for 1 hour periods", async function () {
			const {
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				xai, 
				xaiMinter, 
				addr1
			} = await loadFixture(deployInfrastructure);

			const tier1 = ethers.parseEther("1250000000");
			const tier1Emission = tier1 / 17520n; //71347031963472194634703n
			const tier2 = tier1 / 2n;
			const tier2Emission = tier1Emission / 2n; //35673515981735159817351n
			
			//get combined total supply of xai and esXai
			let combinedTotalSupply = await referee.getCombinedTotalSupply();
			assert.equal(combinedTotalSupply, 0n, "Unexpected starting supply");
			
			//mint Xai to establish emission tiers
			const xaiToMint = ethers.parseEther("1240000000"); //slightly less so we're still in tier 1
			await xai.connect(xaiMinter).mint(addr1, xaiToMint);

			//check emissions and tier again
			combinedTotalSupply = await referee.getCombinedTotalSupply();
			assert.equal(combinedTotalSupply, xaiToMint, "Unexpected supply");
			
			await setupRefereeForMockupRollup(referee, mockRollup);
			assert.equal(await referee.rollupAddress(), await mockRollup.getAddress());
			assert.equal(await referee.isCheckingAssertions(), true);
		    
			// Submit a challenge
			let currentAssertion = 2;
			let previousAssertion = 0;
			await submitMockRollupChallenge(
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				currentAssertion,
				previousAssertion,
				null,
				null
			);

			//get challenge data
			let challenge = await referee.challenges(0);
			let totalEmission = challenge[10] + challenge[11]; //reward + gas subsidy
			
			// Call calculateChallengeEmissionAndTier function and it will return the expected emission for the time passed since the last challenge
			const calculateRes = await referee.calculateChallengeEmissionAndTier();
			assert.equal(calculateRes[0], tier1Emission, "Unexpected Emissions calculation");
			assert.equal(calculateRes[1], tier1, "Unexpected Tier calculation");
			assert.equal(totalEmission, tier1Emission, "Unexpected Challenge Emission");

			// Wait some time
			const blockOffset = 4;
			await ethers.provider.send("evm_increaseTime", [3600 - blockOffset]); //3600 seconds = 1 hour
			await ethers.provider.send("evm_mine"); //mine block to apply new time

			//mint more xai to cross into next tier
			const xaiToMintTier2 = ethers.parseEther("625000000");
			await xai.connect(xaiMinter).mint(addr1, xaiToMintTier2);
			
			// Submit another challenge
			currentAssertion = 4;
			previousAssertion = 2;
			await submitMockRollupChallenge(
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				currentAssertion,
				previousAssertion,
				null,
				null
			);

			//get challenge data
			challenge = await referee.challenges(1);
			totalEmission = challenge[10] + challenge[11]; //reward + gas subsidy
			
			// Check the emission values based off of the time and emission values formula
			const calculateRes2 = await referee.calculateChallengeEmissionAndTier();
			assert.equal(calculateRes2[0], tier2Emission, "Unexpected Emissions calculation");
			assert.equal(calculateRes2[1], tier2, "Unexpected Tier calculation");
			assert.equal(totalEmission, tier2Emission, "Unexpected Challenge Emission");
		});

		it("Check rewards calculations are correct over varying time periods", async function () {
			const {
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				xai, 
				xaiMinter, 
				addr1
			} = await loadFixture(deployInfrastructure);

			const tier1 = ethers.parseEther("1250000000");
			const tier1Emission = tier1 / 17520n; //71347031963472194634703n
			const tier2 = tier1 / 2n;
			const tier2Emission = tier1Emission / 2n; //35673515981735159817351n
			
			//get combined total supply of xai and esXai
			let combinedTotalSupply = await referee.getCombinedTotalSupply();
			assert.equal(combinedTotalSupply, 0n, "Unexpected starting supply");
			
			//mint Xai to establish emission tiers
			const xaiToMint = ethers.parseEther("1240000000"); //slightly less so we're still in tier 1
			await xai.connect(xaiMinter).mint(addr1, xaiToMint);

			//check emissions and tier again
			combinedTotalSupply = await referee.getCombinedTotalSupply();
			assert.equal(combinedTotalSupply, xaiToMint, "Unexpected supply");
			
			await setupRefereeForMockupRollup(referee, mockRollup);
			assert.equal(await referee.rollupAddress(), await mockRollup.getAddress());
			assert.equal(await referee.isCheckingAssertions(), true);
		    
			// Submit a challenge
			let currentAssertion = 2;
			let previousAssertion = 0;
			await submitMockRollupChallenge(
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				currentAssertion,
				previousAssertion,
				null,
				null
			);

			//get challenge data
			let challenge = await referee.challenges(0);
			let totalEmission = challenge[10] + challenge[11]; //reward + gas subsidy
			
			// Call calculateChallengeEmissionAndTier function and it will return the expected emission for the time passed since the last challenge
			const calculateRes = await referee.calculateChallengeEmissionAndTier();
			assert.equal(calculateRes[0], tier1Emission, "Unexpected Emissions calculation");
			assert.equal(calculateRes[1], tier1, "Unexpected Tier calculation");
			assert.equal(totalEmission, tier1Emission, "Unexpected Challenge Emission");

			// Wait some time
			let blockOffset = 4;
			const twoHoursSeconds = 7200; //2 hours
			await ethers.provider.send("evm_increaseTime", [twoHoursSeconds - blockOffset]);
			await ethers.provider.send("evm_mine"); //mine block to apply new time

			//mint more xai to cross into next tier
			const xaiToMintTier2 = ethers.parseEther("625000000");
			await xai.connect(xaiMinter).mint(addr1, xaiToMintTier2);

			// Submit another challenge
			currentAssertion = 4;
			previousAssertion = 2;
			await submitMockRollupChallenge(
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				currentAssertion,
				previousAssertion,
				null,
				null
			);

			//get challenge data
			challenge = await referee.challenges(1);
			totalEmission = challenge[10] + challenge[11]; //reward + gas subsidy
			
			// Check the emission values based off of the time and emission values formula
			const calculateRes2 = await referee.calculateChallengeEmissionAndTier();
			assert.equal(calculateRes2[0], tier2Emission, "Unexpected Emissions calculation");
			assert.equal(calculateRes2[1], tier2, "Unexpected Tier calculation");
			assert.equal(totalEmission, tier2Emission * 2n, "Unexpected Challenge Emission");

			// Wait some time
			const blockOffset2 = 3;
			const tenHoursSeconds = 36000; //10 hours
			await ethers.provider.send("evm_increaseTime", [tenHoursSeconds - blockOffset2]);
			await ethers.provider.send("evm_mine"); //mine block to apply new time
			
			// Submit another challenge
			currentAssertion = 6;
			previousAssertion = 4;
			await submitMockRollupChallenge(
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				currentAssertion,
				previousAssertion,
				null,
				null
			);

			//get challenge data
			challenge = await referee.challenges(2);
			totalEmission = challenge[10] + challenge[11]; //reward + gas subsidy
			
			// Check the emission values based off of the time and emission values formula
			const calculateRes3 = await referee.calculateChallengeEmissionAndTier();
			assert.equal(calculateRes3[0], tier2Emission, "Unexpected Emissions calculation");
			assert.equal(calculateRes3[1], tier2, "Unexpected Tier calculation");
			assert.equal(totalEmission, tier2Emission * 10n, "Unexpected Challenge Emission");

			// Wait some time
			const thirtyMinsSeconds = 1800; //30 mins
			await ethers.provider.send("evm_increaseTime", [thirtyMinsSeconds - blockOffset2]);
			await ethers.provider.send("evm_mine"); //mine block to apply new time
			
			// Submit another challenge
			currentAssertion = 8;
			previousAssertion = 6;
			await submitMockRollupChallenge(
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				currentAssertion,
				previousAssertion,
				null,
				null
			);

			//get challenge data
			challenge = await referee.challenges(3);
			totalEmission = challenge[10] + challenge[11]; //reward + gas subsidy
			
			// Check the emission values based off of the time and emission values formula
			const calculateRes4 = await referee.calculateChallengeEmissionAndTier();
			assert.equal(calculateRes4[0], tier2Emission, "Unexpected Emissions calculation");
			assert.equal(calculateRes4[1], tier2, "Unexpected Tier calculation");
			assert.equal(totalEmission, tier2Emission / 2n, "Unexpected Challenge Emission");

			// Wait some time
			const oneMinSeconds = 60; //1 minute
			await ethers.provider.send("evm_increaseTime", [oneMinSeconds - blockOffset2]);
			await ethers.provider.send("evm_mine"); //mine block to apply new time
			
			// Submit another challenge
			currentAssertion = 10;
			previousAssertion = 8;
			await submitMockRollupChallenge(
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				currentAssertion,
				previousAssertion,
				null,
				null
			);

			//get challenge data
			challenge = await referee.challenges(4);
			totalEmission = challenge[10] + challenge[11]; //reward + gas subsidy
			
			// Check the emission values based off of the time and emission values formula
			const calculateRes5 = await referee.calculateChallengeEmissionAndTier();
			assert.equal(calculateRes5[0], tier2Emission, "Unexpected Emissions calculation");
			assert.equal(calculateRes5[1], tier2, "Unexpected Tier calculation");
			assert.equal(totalEmission, tier2Emission / 60n, "Unexpected Challenge Emission");

			// Wait some time
			const thirtySeconds = 30; //30 seconds
			await ethers.provider.send("evm_increaseTime", [thirtySeconds - blockOffset2]);
			await ethers.provider.send("evm_mine"); //mine block to apply new time
			
			// Submit another challenge
			currentAssertion = 12;
			previousAssertion = 10;
			await submitMockRollupChallenge(
				referee, 
				challenger, 
				mockRollup, 
				refereeCalculations, 
				currentAssertion,
				previousAssertion,
				null,
				null
			);

			//get challenge data
			challenge = await referee.challenges(5);
			totalEmission = challenge[10] + challenge[11]; //reward + gas subsidy
			
			// Check the emission values based off of the time and emission values formula
			const calculateRes6 = await referee.calculateChallengeEmissionAndTier();
			assert.equal(calculateRes6[0], tier2Emission, "Unexpected Emissions calculation");
			assert.equal(calculateRes6[1], tier2, "Unexpected Tier calculation");
			assert.equal(totalEmission, tier2Emission / 120n, "Unexpected Challenge Emission");
		});
		
		// describe("The Referee should allow users to stake in V1", function () {

		//     it("Check that staked/unstaked amount is taken/given from user's esXai balance", async function () {
		//         const { esXai, referee, addr1, esXaiMinter, nodeLicense } = await loadFixture(deployInfrastructure);
		//         const numLicense = await nodeLicense.balanceOf(addr1);
		//         const maxAmountStake = await referee.getMaxStakeAmount(numLicense);
		//         await esXai.connect(esXaiMinter).mint(addr1, maxAmountStake);
		//         const initialBalance = await esXai.balanceOf(addr1);
		//         const initialRefereeBalance = await esXai.balanceOf((await referee.getAddress()));
		//         await esXai.connect(addr1).approve(await referee.getAddress(), maxAmountStake);
		//         await referee.connect(addr1).stake(maxAmountStake);
		//         expect(await referee.stakedAmounts(addr1)).to.equal(maxAmountStake);
		//         const balanceAfterStake = await esXai.balanceOf(addr1);
		//         const balanceRefereeAfterStake = await esXai.balanceOf((await referee.getAddress()));
		//         expect(balanceAfterStake).to.equal(initialBalance - maxAmountStake);
		//         expect(balanceRefereeAfterStake).to.equal(initialRefereeBalance + maxAmountStake);
		//         await referee.connect(addr1).unstake(maxAmountStake);
		//         const balanceAfterUnstake = await esXai.balanceOf(addr1);
		//         const balanceRefereeAfterUnstake = await esXai.balanceOf((await referee.getAddress()));
		//         expect(balanceAfterUnstake).to.equal(initialBalance);
		//         expect(balanceRefereeAfterUnstake).to.equal(initialRefereeBalance);
		//     })

		//     it("Check that maximum staked amount is limited", async function () {
		//         const { esXai, referee, addr1, esXaiMinter, nodeLicense } = await loadFixture(deployInfrastructure);

		//         const numLicense = await nodeLicense.balanceOf(addr1);
		//         const maxAmountStake = await referee.getMaxStakeAmount(numLicense);
		//         await esXai.connect(esXaiMinter).mint(addr1, maxAmountStake);
		//         await esXai.connect(addr1).approve(await referee.getAddress(), maxAmountStake + BigInt(1));

		//         // Try stake more than allowed per Nodelicense, should fail
		//         await expect(referee.connect(addr1).stake(maxAmountStake + BigInt(1))).to.be.revertedWith("Maximum staking amount exceeded");

		//         // Stake exactly max amount allowed per Nodelicense, should work
		//         await referee.connect(addr1).stake(maxAmountStake);
		//         expect(await referee.stakedAmounts(addr1)).to.equal(maxAmountStake);

		//         // Try stake some more, should fail
		//         await expect(referee.connect(addr1).stake(BigInt(1))).to.be.revertedWith("Maximum staking amount exceeded");

		//         await referee.connect(addr1).unstake(maxAmountStake);
		//     })

		//     it("Check that maximum staked amount increases with more NodeLicenses", async function () {
		//         const { esXai, referee, addr1, esXaiMinter, nodeLicense} = await loadFixture(deployInfrastructure);
		//         const numLicense = await nodeLicense.balanceOf(addr1);
		//         const maxAmountStake = await referee.getMaxStakeAmount(numLicense);
		//         await esXai.connect(esXaiMinter).mint(addr1, maxAmountStake + BigInt(1));
		//         await esXai.connect(addr1).approve(await referee.getAddress(), maxAmountStake + BigInt(1));

		//         await referee.connect(addr1).stake(maxAmountStake);
		//         await expect(referee.connect(addr1).stake(BigInt(1))).to.be.revertedWith("Maximum staking amount exceeded");

		//         let price = await nodeLicense.price(1, "");
		//         await nodeLicense.connect(addr1).mint(1, "", {value: price});

		//         await referee.connect(addr1).stake(BigInt(1));
		//         expect(await referee.stakedAmounts(addr1)).to.equal(maxAmountStake + BigInt(1));
		//         await referee.connect(addr1).unstake(maxAmountStake + BigInt(1));
		//     })

		//     it("Check that reward chance increases with higher boostFactor", async function () {
		//         const { referee } = await loadFixture(deployInfrastructure);

		//         const numIterations = 10000;
		//         const baseFactor = 100;
		//         const baseNumWins = getNumWinningStateRoots(numIterations, baseFactor);

		//         const boostFactors = [125, 150, 175, 200]; // 125 => 1.25 x the chance, 400 => 4 times the chance to win
		//         for (const boostFactor of boostFactors) {
		//             const boostedNumWins = getNumWinningStateRoots(numIterations, boostFactor);
		//             expect(boostedNumWins / baseNumWins).to.be.closeTo(boostFactor / 100, 0.5);  // expect to win 2 - 3 times more often
		//         }

		//         return Promise.resolve();
		//     }).timeout(300_000) // 5 min

		//     it("Check that reward chance increases with higher staking amount", async function () {
		//         const { referee, challenger, esXai, esXaiMinter, nodeLicense, addr1, addr2, addr3 } = await loadFixture(deployInfrastructure);

		//         // Stake as addr2 to trigger boost to silver tier
		//         const stakeAmount2 = BigInt(10_000) * BigInt(10 ** 18);
		//         await esXai.connect(esXaiMinter).mint(addr2, stakeAmount2);
		//         await esXai.connect(addr2).approve(await referee.getAddress(), stakeAmount2);
		//         await referee.connect(addr2).stake(stakeAmount2);
		//         const expectedBoostFactor2 = Number(await referee.getBoostFactor(stakeAmount2));

		//         let price = await nodeLicense.price(100, "");
		//         await nodeLicense.connect(addr3).mint(100, "", { value: price });

		//         // Stake as addr3 to trigger boost to gold tier
		//         const stakeAmount3 = BigInt(50_000) * BigInt(10 ** 18);
		//         await esXai.connect(esXaiMinter).mint(addr3, stakeAmount3);
		//         await esXai.connect(addr3).approve(await referee.getAddress(), stakeAmount3);
		//         await referee.connect(addr3).stake(stakeAmount3);
		//         const expectedBoostFactor3 = Number(await referee.getBoostFactor(stakeAmount3));

		//         // Enter 250 challenges as addr1 (no boost), addr2 and addr3 (boosted)
		//         const numSubmissions = 1000;
		//         const stateRoots = await getStateRoots(numSubmissions * 2);
		//         let numBasePayouts = 0;
		//         let numBoostedPayouts2 = 0;
		//         let numBoostedPayouts3 = 0;
		//         for (let i = 0; i < numSubmissions; i++) {
		//             const stateRoot = stateRoots[i];

		//             // console.log("Iteration", i);

		//             // Submit a challenge
		//             await referee.connect(challenger).submitChallenge(
		//                 i + 1,
		//                 i,
		//                 stateRoot,
		//                 0,
		//                 "0x0000000000000000000000000000000000000000000000000000000000000000"
		//             );

		//             // check to see the challenge is open for submissions
		//             const { openForSubmissions } = await referee.getChallenge(i);
		//             expect(openForSubmissions).to.be.eq(true);

		//             // Submit assertions
		//             await referee.connect(addr1).submitAssertionToChallenge(1, i, stateRoot);
		//             await referee.connect(addr2).submitAssertionToChallenge(2, i, stateRoot);
		//             await referee.connect(addr3).submitAssertionToChallenge(12, i, stateRoot);

		//             // Check submissions, count payouts
		//             const submission1 = await referee.getSubmissionsForChallenges([i], 1);
		//             assert.equal(submission1[0].submitted, true, "The submission was not submitted");
		//             if (submission1[0].eligibleForPayout) {
		//                 numBasePayouts++;
		//             }
		//             const submission2 = await referee.getSubmissionsForChallenges([i], 2);
		//             assert.equal(submission2[0].submitted, true, "The submission was not submitted");
		//             if (submission2[0].eligibleForPayout) {
		//                 numBoostedPayouts2++;
		//             }
		//             const submission3 = await referee.getSubmissionsForChallenges([i], 12);
		//             assert.equal(submission3[0].submitted, true, "The submission was not submitted");
		//             if (submission3[0].eligibleForPayout) {
		//                 numBoostedPayouts3++;
		//             }
		//         }

		//         const resultingBoostFactor2 = numBoostedPayouts2 / numBasePayouts;
		//         const resultingBoostFactor3 = numBoostedPayouts3 / numBasePayouts;

		//         // console.log("Base payouts", numBasePayouts);
		//         // console.log(`Boosted payouts (addr2): ${numBoostedPayouts2} - expected boost: ${expectedBoostFactor2} - calculated boost: ${resultingBoostFactor2}`);
		//         // console.log(`Boosted payouts (addr3): ${numBoostedPayouts3} - expected boost: ${expectedBoostFactor3} - calculated boost: ${resultingBoostFactor3}`);

		//         expect(resultingBoostFactor2).to.be.closeTo(expectedBoostFactor2 / 100, 1);  // Expect to win 1 - 3 times as often (EV=2)
		//         expect(resultingBoostFactor3).to.be.closeTo(expectedBoostFactor3 / 100, 2);  // Expect to win 2 - 6 times as often (EV=4)

		//         return Promise.resolve();
		//     }).timeout(300_000) // 5 min
		// })


		// These can only be run on a fork from the mainnet chain using the mainnet rollup.
		// For Referee9 we removed toggleAssertionChecking so these testcases need to be udpated.
		// These tests have not been run since Referee2
		// describe("The rollup protocol should be checking if values are correct", function () {

		//     it("Check that toggling assertion, makes so you have to send in the correct assertion data from the rollup protocol", async function () {
		//         const { referee, refereeDefaultAdmin, challenger } = await loadFixture(deployInfrastructure);

		//         // check isCheckingAssertions is false
		//         const isCheckingAssertionsBefore = await referee.isCheckingAssertions();
		//         assert.equal(isCheckingAssertionsBefore, false, "Assertions are turned on");

		//         // turn on assertion checking
		//         await referee.connect(refereeDefaultAdmin).toggleAssertionChecking();

		//         // check isCheckingAssertions is true
		//         const isCheckingAssertionsAfter = await referee.isCheckingAssertions();
		//         assert.equal(isCheckingAssertionsAfter, true, "Assertions are turned off");

		//         // get an arbitrary node from the protocol and check to see that the referee actually checks it
		//         await referee.connect(challenger).submitChallenge(
		//             2252,
		//             2251,
		//             "0x2fd53fdb1cd3d34d509978b94af510451ab103c5ba7aef645fd27c97af8aacb0",
		//             10117582,
		//             "0x0000000000000000000000000000000000000000000000000000000000000000"
		//         );
		//     })

		//     it("Check that passing an incorrect _predecessorAssertionId throws an error", async function() {

		//         const {referee, refereeDefaultAdmin, challenger} = await loadFixture(deployInfrastructure);

		//         // check isCheckingAssertions is false
		//         const isCheckingAssertionsBefore = await referee.isCheckingAssertions();
		//         assert.equal(isCheckingAssertionsBefore, false, "Assertions are turned on");

		//         // turn on assertion checking
		//         await referee.connect(refereeDefaultAdmin).toggleAssertionChecking();

		//         // check isCheckingAssertions is true
		//         const isCheckingAssertionsAfter = await referee.isCheckingAssertions();
		//         assert.equal(isCheckingAssertionsAfter, true, "Assertions are turned off");

		//         await expect(
		//             referee.connect(challenger).submitChallenge(
		//                 2252,
		//                 9999,
		//                 "0x2fd53fdb1cd3d34d509978b94af510451ab103c5ba7aef645fd27c97af8aacb0",
		//                 10117582,
		//                 "0x0000000000000000000000000000000000000000000000000000000000000000"
		//             )
		//         ).to.be.revertedWith("10");
		//     })

		//     it("Check that passing an incorrect _confirmData throws an error", async function() {

		//         const {referee, refereeDefaultAdmin, challenger} = await loadFixture(deployInfrastructure);

		//         // check isCheckingAssertions is false
		//         const isCheckingAssertionsBefore = await referee.isCheckingAssertions();
		//         assert.equal(isCheckingAssertionsBefore, false, "Assertions are turned on");

		//         // turn on assertion checking
		//         await referee.connect(refereeDefaultAdmin).toggleAssertionChecking();

		//         // check isCheckingAssertions is true
		//         const isCheckingAssertionsAfter = await referee.isCheckingAssertions();
		//         assert.equal(isCheckingAssertionsAfter, true, "Assertions are turned off");

		//         await expect(
		//             referee.connect(challenger).submitChallenge(
		//                 2252,
		//                 2251,
		//                 "0x0000000000000000000000000000000000000000000000000000000000000000",
		//                 10117582,
		//                 "0x0000000000000000000000000000000000000000000000000000000000000000"
		//             )
		//         ).to.be.revertedWith("11");
		//     })

		//     it("Check that passing an incorrect _assertionTimestamp throws an error", async function() {

		//         const {referee, refereeDefaultAdmin, challenger} = await loadFixture(deployInfrastructure);

		//         // check isCheckingAssertions is false
		//         const isCheckingAssertionsBefore = await referee.isCheckingAssertions();
		//         assert.equal(isCheckingAssertionsBefore, false, "Assertions are turned on");

		//         // turn on assertion checking
		//         await referee.connect(refereeDefaultAdmin).toggleAssertionChecking();

		//         // check isCheckingAssertions is true
		//         const isCheckingAssertionsAfter = await referee.isCheckingAssertions();
		//         assert.equal(isCheckingAssertionsAfter, true, "Assertions are turned off");

		//         await expect(
		//             referee.connect(challenger).submitChallenge(
		//                 2252,
		//                 2251,
		//                 "0x2fd53fdb1cd3d34d509978b94af510451ab103c5ba7aef645fd27c97af8aacb0",
		//                 99999999,
		//                 "0x0000000000000000000000000000000000000000000000000000000000000000"
		//             )
		//         ).to.be.revertedWith("12");
		//     })
		// })
	}
}
