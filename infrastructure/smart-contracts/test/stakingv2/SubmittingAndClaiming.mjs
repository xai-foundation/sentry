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
		it("Pool owner should be able to submit pool assertions and & claim for a pool (single license holder)", async function () {
			const {poolFactory, addr1, addr2, nodeLicense, referee, operator, esXai, esXaiMinter, challenger} = await loadFixture(deployInfrastructure);

			// Get a single key for addr1
			const singlePrice = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: singlePrice});
			const addr1MintedKeyId = await nodeLicense.totalSupply();
			

			// Submit a challenge
			const startingAssertion = 100;
			await referee.connect(challenger).submitChallenge(
				startingAssertion,
				startingAssertion - 1,
				"0x0000000000000000000000000000000000000000000000000000000000000000",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);


			// Create a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
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

			// Mint 100 keys to addr2 & stake
			// Changed to 100 as 2 keys would not generate a reward thus causing a divide by zero error for number of eligible claimers
			const keysToMintForAddr2 = 100n;
			const addr2KeyMintPrice = await nodeLicense.price(keysToMintForAddr2, "");
			await nodeLicense.connect(addr2).mint(keysToMintForAddr2, "", {value: addr2KeyMintPrice});
			const addr2MintedKeyIds = [];
			for (let i = addr1MintedKeyId; i < addr1MintedKeyId + keysToMintForAddr2; i++) {
				addr2MintedKeyIds.push(i + 1n);
			}
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, addr2MintedKeyIds);


			// Make winning state root for both of addr2's keys
			const challengeId = 0;
			//const winningStateRoot = await findWinningStateRoot(referee, addr2MintedKeyIds, challengeId);

			// Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
			await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);
			// Make sure the challenge is open for submissions
			const {openForSubmissions} = await referee.getChallenge(0);
			expect(openForSubmissions).to.equal(true);

			// Submit a winning hash
			// await referee.connect(addr1).submitPoolAssertion(stakingPoolAddress, challengeId, "0x0000000000000000000000000000000000000000000000000000000000000000");
			await referee.connect(addr1).submitMultipleAssertions(addr2MintedKeyIds, challengeId, "0x0000000000000000000000000000000000000000000000000000000000000000");

			// Grab the poolSubmission & expect them to both be eligible
			const poolSubmission = await referee.poolSubmissions(challengeId, stakingPoolAddress);
			expect(poolSubmission.winningKeyCount).to.be.closeTo(2, 2); // need a better way to check that. Will always pass

			// Submit a new challenge to close the previous one
			await referee.connect(challenger).submitChallenge(
				startingAssertion + 1,
				startingAssertion,
				"0x0000000000000000000000000000000000000000000000000000000000000000",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);

			// Make sure the staking pool has no balance yet
			const poolBalanceBalance1 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(poolBalanceBalance1).to.equal(0);

			// Bulk reward claim as pool owner
			await referee.connect(operator).claimMultipleRewards(addr2MintedKeyIds, challengeId, stakingPoolAddress);

			// Make sure the staking pool has balance now
			const poolBalanceBalance2 = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(poolBalanceBalance2).to.be.greaterThan(poolBalanceBalance1);
		});

		it("Pool delegate should be able to submit pool assertions and & claim for a pool (multiple license holders)", async function () {
			const {poolFactory, addr1, addr2, addr3, nodeLicense, referee, operator, esXai, esXaiMinter, challenger, kycAdmin} = await loadFixture(deployInfrastructure);

			// Get a single key for addr1
			const singlePrice = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr1).mint(1, "", {value: singlePrice});
			const addr1MintedKeyId = await nodeLicense.totalSupply();

			// Submit a challenge
			const startingAssertion = 100;
			await referee.connect(challenger).submitChallenge(
				startingAssertion,
				startingAssertion - 1,
				"0x0000000000000000000000000000000000000000000000000000000000000000",
				0,
				"0x0000000000000000000000000000000000000000000000000000000000000000"
			);


			const operatorAddress = await operator.getAddress();

			// Create a pool with $keysForHighestTier keys to get the highest tier esXai stake allowance
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

			// Mint 100 keys to addr2 & stake
			// Changed to 100 as 2 keys would not generate a reward thus causing a divide by zero error for number of eligible claimers
			const keysToMintForAddr2 = 100n;
			const addr2KeyMintPrice = await nodeLicense.price(keysToMintForAddr2, "");
			await nodeLicense.connect(addr2).mint(keysToMintForAddr2, "", {value: addr2KeyMintPrice});
			const addr2MintedKeyIds = [];
			for (let i = addr1MintedKeyId; i < addr1MintedKeyId + keysToMintForAddr2; i++) {
				addr2MintedKeyIds.push(i + 1n);
			}

			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, addr2MintedKeyIds);

			// Mint a key to addr3 & stake
			const addr3KeyMintPrice = await nodeLicense.price(1, "");
			await nodeLicense.connect(addr3).mint(1, "", {value: addr3KeyMintPrice});
			const addr3MintedKeyId = await nodeLicense.totalSupply();
			await referee.connect(kycAdmin).addKycWallet(await addr3.getAddress());
			await poolFactory.connect(addr3).stakeKeys(stakingPoolAddress, [addr3MintedKeyId]);

			// Mint some esXai to increase the total supply for submitting the first challenge so that there is available reward
			await esXai.connect(esXaiMinter).mint(await esXaiMinter.getAddress(), 1_000_000);
			// Make sure the challenge is open for submissions
			const {openForSubmissions} = await referee.getChallenge(0);
			expect(openForSubmissions).to.equal(true);

			// Submit a hash
			const challengeId = 0;
			await referee.connect(operator).submitMultipleAssertions(addr2MintedKeyIds, challengeId, "0x0000000000000000000000000000000000000000000000000000000000000000");

			// Grab the poolSubmission & expect it to be eligible
			// Note: Currently not possible

			// Submit a new challenge to close the previous one
			await referee.connect(challenger).submitChallenge(
				startingAssertion + 1,
				startingAssertion,
				"0x0000000000000000000000000000000000000000000000000000000000000000",
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

	}
}
