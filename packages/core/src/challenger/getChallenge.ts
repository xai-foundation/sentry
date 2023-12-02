import { ethers } from "ethers";
import { RefereeAbi } from "../abis/index.js";
import { config } from "../config.js";
import { getProvider } from "../index.js";

/**
 * Challenge structure returned by the getChallenge function.
 */
export interface Challenge {
    openForSubmissions: boolean;
    expiredForRewarding: boolean;
    assertionId: bigint;
    assertionStateRootOrConfirmData: string;
    assertionTimestamp: bigint;
    challengerSignedHash: string;
    activeChallengerPublicKey: string;
    rollupUsed: string;
    createdTimestamp: bigint;
    totalSupplyOfNodesAtChallengeStart: bigint;
    rewardAmountForClaimers: bigint;
    amountForGasSubsidy: bigint;
    numberOfEligibleClaimers: bigint;
    amountClaimedByClaimers: bigint;
}

/**
 * Fetches the challenge of a given challenge Id.
 * @param challengeId - The ID of the challenge.
 * @returns The challenge.
 */
export async function getChallenge(challengeId: bigint): Promise<Challenge> {
    const provider = getProvider();
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);
    const [
        openForSubmissions,
        expiredForRewarding,
        assertionId,
        assertionStateRootOrConfirmData,
        assertionTimestamp,
        challengerSignedHash,
        activeChallengerPublicKey,
        rollupUsed,
        createdTimestamp,
        totalSupplyOfNodesAtChallengeStart,
        rewardAmountForClaimers,
        amountForGasSubsidy,
        numberOfEligibleClaimers,
        amountClaimedByClaimers
    ] = await refereeContract.getChallenge(challengeId);
    const challenge: Challenge = {
        openForSubmissions,
        expiredForRewarding,
        assertionId: BigInt(assertionId),
        assertionStateRootOrConfirmData,
        assertionTimestamp: BigInt(assertionTimestamp),
        challengerSignedHash,
        activeChallengerPublicKey,
        rollupUsed,
        createdTimestamp: BigInt(createdTimestamp),
        totalSupplyOfNodesAtChallengeStart: BigInt(totalSupplyOfNodesAtChallengeStart),
        rewardAmountForClaimers: BigInt(rewardAmountForClaimers),
        amountForGasSubsidy: BigInt(amountForGasSubsidy),
        numberOfEligibleClaimers: BigInt(numberOfEligibleClaimers),
        amountClaimedByClaimers: BigInt(amountClaimedByClaimers)
    }
    return challenge;
}
