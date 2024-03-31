import {CreatePool} from "./stakingv2/CreatePool.mjs";
import {UpdatePool} from "./stakingv2/UpdatePool.mjs";
import {StakeKeysToPool} from "./stakingv2/StakeKeysToPool.mjs";
import {StakeEsXaiToPool} from "./stakingv2/StakeEsXaiToPool.mjs";
import {VerifyBoostFactor} from "./stakingv2/VerifyBoostFactor.mjs";
import {Rewards} from "./stakingv2/Rewards.mjs";
import {SubmittingAndClaiming} from "./stakingv2/SubmittingAndClaiming.mjs";
import {UnStakingPeriods} from "./stakingv2/UnStakingPeriods.mjs";

export async function findHighestStakeTier(referee, refAdmin) {
	let highestFoundStakeAmountTierThreshold = 0;
	let highestFoundTier = 0;
	let searchingForMaxTier = true;
	while (searchingForMaxTier) {
		try {
			highestFoundStakeAmountTierThreshold = await referee.connect(refAdmin).stakeAmountTierThresholds(highestFoundTier);
			highestFoundTier++;
		} catch {
			searchingForMaxTier = false;
			if (highestFoundTier > 0) {
				highestFoundTier--;
			}
		}
	}

	return [highestFoundStakeAmountTierThreshold, highestFoundTier];
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

export function StakingV2(deployInfrastructure) {
	return function () {

		// describe("Create Pool #187167264", CreatePool(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Update Pool #187167268", UpdatePool(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Stake Key to pool #187167267", StakeKeysToPool(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Stake esXai to pool #187167334", StakeEsXaiToPool(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Verify boost factor #187167332", VerifyBoostFactor(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Rewards", Rewards(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		// describe("Submitting & Claiming", SubmittingAndClaiming(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		describe("Un-staking periods", UnStakingPeriods(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
	}
}
