import { SentryKey, PoolChallenge, PoolInfo } from "../../generated/schema";
import { BigInt, Bytes, Address, log } from "@graphprotocol/graph-ts"
/**
 * Pass in a challenge Id, sentryKey, rewardAmount and tx hash. This function will lookup all necessary data from the pool challenges
 * and update the pool challenges entity with the new data.
 * 
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export function updatePoolChallengeOnClaim(challengeId: BigInt, sentryKey: SentryKey, rewardAmount: BigInt, transactionHash: Bytes): void {
  //Check if claiming key was part of a pool
  if (sentryKey.assignedPool.toHexString() != new Address(0).toHexString()) {
    //Load the Pool Challenges entity
    let poolChallenges = PoolChallenge.load(sentryKey.assignedPool.toHexString() + "_" + challengeId.toString());

    if (poolChallenges == null) {
      // There can be a scenario where a key got staked after the submission and then claimed for the pool
      // This would mean the PoolChallenge was not created and we either want to create it now
      const pool = PoolInfo.load(sentryKey.assignedPool.toHexString())
      poolChallenges = new PoolChallenge(sentryKey.assignedPool.toHexString() + "_" + challengeId.toString())
      poolChallenges.pool = pool!.id; //We need to expect the pool entity to exist when a key is assigned, else the subgraph should fail
      poolChallenges.challenge = challengeId.toString()
      poolChallenges.submittedKeyCount = BigInt.fromI32(0)
      poolChallenges.claimKeyCount = BigInt.fromI32(0)
      poolChallenges.totalClaimedEsXaiAmount = BigInt.fromI32(0)
      poolChallenges.eligibleSubmissionsCount = BigInt.fromI32(0)
      poolChallenges.totalStakedEsXaiAmount = pool!.totalStakedEsXaiAmount
      poolChallenges.totalStakedKeyAmount = pool!.totalStakedKeyAmount
    }
    //Increment key count and esXai amount claimed
    poolChallenges.claimKeyCount = poolChallenges.claimKeyCount.plus(BigInt.fromI32(1));
    poolChallenges.totalClaimedEsXaiAmount = poolChallenges.totalClaimedEsXaiAmount.plus(rewardAmount);
    poolChallenges.save();
    return;
  }
}