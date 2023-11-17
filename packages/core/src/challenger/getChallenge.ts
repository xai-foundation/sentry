import { ethers } from "ethers";
import { RefereeAbi } from "../abis/index.js";
import { config } from "../config.js";
import { getProvider } from "../index.js";

/**
 * Challenge structure returned by the getChallenge function.
 */
export interface Challenge {
    openForSubmissions: boolean;
    assertionId: bigint;
    predecessorAssertionId: bigint;
    assertionStateRoot: string;
    assertionTimestamp: bigint;
    challengerSignedHash: string;
    activeChallengerPublicKey: string;
    rollupUsed: string;
    createdTimestamp: bigint;
    closeTimestamp: bigint;
    totalSupplyOfNodesAtChallengeStart: bigint;
    rewardAmountForClaimers: bigint;
    amountForGasSubsidy: bigint;
    numberOfEligibleClaimers: bigint;
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
        assertionId,
        predecessorAssertionId,
        assertionStateRoot,
        assertionTimestamp,
        challengerSignedHash,
        activeChallengerPublicKey,
        rollupUsed,
        createdTimestamp,
        closeTimestamp,
        totalSupplyOfNodesAtChallengeStart,
        rewardAmountForClaimers,
        amountForGasSubsidy,
        numberOfEligibleClaimers
    ] = await refereeContract.getChallenge(challengeId);
    const challenge: Challenge = {
        openForSubmissions,
        assertionId: BigInt(assertionId),
        predecessorAssertionId: BigInt(predecessorAssertionId),
        assertionStateRoot,
        assertionTimestamp: BigInt(assertionTimestamp),
        challengerSignedHash,
        activeChallengerPublicKey,
        rollupUsed,
        createdTimestamp: BigInt(createdTimestamp),
        closeTimestamp: BigInt(closeTimestamp),
        totalSupplyOfNodesAtChallengeStart: BigInt(totalSupplyOfNodesAtChallengeStart),
        rewardAmountForClaimers: BigInt(rewardAmountForClaimers),
        amountForGasSubsidy: BigInt(amountForGasSubsidy),
        numberOfEligibleClaimers: BigInt(numberOfEligibleClaimers)
    }
    return challenge;
}
