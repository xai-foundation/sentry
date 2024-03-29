import {expect, assert} from "chai";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {findWinningStateRoot} from "../Referee.mjs";

export function SubmittingAndClaiming(deployInfrastructure, poolConfigurations) {
	const {
		validShareValues,
		poolMetaData,
		poolSocials,
		poolTrackerDetails,
		noDelegateOwner,
	} = poolConfigurations;

	return function () {
		it("Pool owner should be able to submit multiple assertions & bulk claim for multiple winning keys in a pool (single license holder)", async function () {
			const {poolFactory, addr1, addr2, nodeLicense, referee, operator, esXai, esXaiMinter, challenger} = await loadFixture(deployInfrastructure);

			// Get a single key for addr1
			const singlePrice = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: singlePrice});
			const addr1MintedKeyId = await nodeLicense.totalSupply();

			// Creat a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[addr1MintedKeyId],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Save the new pool's address
			const stakingPoolAddress = await poolFactory.connect(addr2).getPoolAddress(0);

			// Mint 2 keys to addr2 & stake
			const keysToMintForAddr2 = 2n;
			const addr2KeyMintPrice = await nodeLicense.price(keysToMintForAddr2, "");
			await nodeLicense.connect(addr2).mint(keysToMintForAddr2, "", {value: addr2KeyMintPrice});
			const addr2MintedKeyIds = [];
			for (let i = addr1MintedKeyId; i < addr1MintedKeyId + keysToMintForAddr2; i++) {
				addr2MintedKeyIds.push(i + 1n);
			}
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, addr2MintedKeyIds);


			// Make winning state root for both of addr2's keys
			const challengeId = 0;
			const winningStateRoot = await findWinningStateRoot(referee, addr2MintedKeyIds, challengeId);

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
			const {openForSubmissions} = await referee.getChallenge(0);
			expect(openForSubmissions).to.equal(true);

			// Approve the operator for addr2
			// const operatorAddress = await operator.getAddress();
			// await referee.connect(addr2).setApprovalForOperator(operatorAddress, true);

			// Submit a winning hash
			await referee.connect(addr1).submitMultipleAssertions(addr2MintedKeyIds, challengeId, winningStateRoot);

			// Grab both the submissions & expect them to both be eligible
			const submission1 = await referee.getSubmissionsForChallenges([challengeId], addr2MintedKeyIds[0]);
			const submission2 = await referee.getSubmissionsForChallenges([challengeId], addr2MintedKeyIds[1]);
			expect(submission1[0].eligibleForPayout).to.equal(true);
			expect(submission2[0].eligibleForPayout).to.equal(true);

			// Submit a new challenge to close the previous one
			await referee.connect(challenger).submitChallenge(
				startingAssertion + 1,
				startingAssertion,
				winningStateRoot,
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);

			// Make sure the staking pool has no balance yet
			const poolBalanceBalance1 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(poolBalanceBalance1).to.equal(0);

			// Bulk reward claim as operator
			await referee.connect(operator).claimMultipleRewards(addr2MintedKeyIds, challengeId, stakingPoolAddress);

			// Make sure the staking pool has balance now
			const poolBalanceBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(poolBalanceBalance2).to.be.greaterThan(poolBalanceBalance1);
		});

		it("Pool delegate should be able to submit multiple assertions & bulk claim for multiple winning keys in a pool (multiple license holders)", async function () {
			const {poolFactory, addr1, addr2, addr3, nodeLicense, referee, operator, esXai, esXaiMinter, challenger, kycAdmin} = await loadFixture(deployInfrastructure);

			// Get a single key for addr1
			const singlePrice = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: singlePrice});
			const addr1MintedKeyId = await nodeLicense.totalSupply();

			const operatorAddress = await operator.getAddress();

			// Creat a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
			await poolFactory.connect(addr1).createPool(
				operatorAddress,
				[addr1MintedKeyId],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Save the new pool's address
			const stakingPoolAddress = await poolFactory.connect(addr2).getPoolAddress(0);

			// Mint a key to addr2 & stake
			const addr2KeyMintPrice = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr2).mint(1, "", {value: addr2KeyMintPrice});
			const addr2MintedKeyId = await nodeLicense.totalSupply();
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [addr2MintedKeyId]);

			// Mint a key to addr3 & stake
			const addr3KeyMintPrice = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr3).mint(1, "", {value: addr3KeyMintPrice});
			const addr3MintedKeyId = await nodeLicense.totalSupply();
			await referee.connect(kycAdmin).addKycWallet(await addr3.getAddress());
			await poolFactory.connect(addr3).stakeKeys(stakingPoolAddress, [addr3MintedKeyId]);

			// Make winning state root for both of addr2's keys
			const challengeId = 0;
			const keys = [addr2MintedKeyId, addr3MintedKeyId];
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
			const {openForSubmissions} = await referee.getChallenge(0);
			expect(openForSubmissions).to.equal(true);

			// Approve the operator for addr2 & addr3
			// const operatorAddress = await operator.getAddress();
			// await referee.connect(addr2).setApprovalForOperator(operatorAddress, true);
			// await referee.connect(addr3).setApprovalForOperator(operatorAddress, true);

			// Submit a winning hash
			await referee.connect(operator).submitMultipleAssertions(keys, challengeId, winningStateRoot);

			// Grab both the submissions & expect them to both be eligible
			const submission1 = await referee.getSubmissionsForChallenges([challengeId], keys[0]);
			const submission2 = await referee.getSubmissionsForChallenges([challengeId], keys[1]);
			expect(submission1[0].eligibleForPayout).to.equal(true);
			expect(submission2[0].eligibleForPayout).to.equal(true);

			// Submit a new challenge to close the previous one
			await referee.connect(challenger).submitChallenge(
				startingAssertion + 1,
				startingAssertion,
				winningStateRoot,
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);

			// Make sure the staking pool has no balance yet
			const poolBalanceBalance1 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(poolBalanceBalance1).to.equal(0);

			// Bulk reward claim as operator
			await referee.connect(operator).claimMultipleRewards(keys, challengeId, stakingPoolAddress);

			// Make sure the staking pool has balance now
			const poolBalanceBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(poolBalanceBalance2).to.be.greaterThan(poolBalanceBalance1);
		});

	}
}
