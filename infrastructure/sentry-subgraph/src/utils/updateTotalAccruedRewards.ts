import { SentryKey, PoolInfo, SentryWallet } from "../../generated/schema";
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts"

/**
 * 
 * Update the total Accrued esXai for either the sentryWallet or the staking pool for key based submissions
 * 
*/
export function updateTotalAccruedRewards(sentryKey: SentryKey, reward: BigInt, event: ethereum.Event): void {
  if (sentryKey.assignedPool.toHexString() == new Address(0).toHexString()) {
    // Rewards claimed to the owner of the key
    const sentryWallet = SentryWallet.load(sentryKey.sentryWallet);
    if (!sentryWallet) {
      log.warning("Failed to find sentryWallet handleAssertionSubmitted: keyID: " + sentryKey.keyId.toString() + ", TX: " + event.transaction.hash.toHexString(), []);
      return;
    }
    sentryWallet.totalAccruedAssertionRewards = sentryWallet.totalAccruedAssertionRewards.plus(reward)
    sentryWallet.save()

  } else {
    // Rewards claimed to the pool the key is staked in
    const pool = PoolInfo.load(sentryKey.assignedPool.toHexString());
    if (!pool) {
      log.warning("Failed to find pool handleAssertionSubmitted: keyID: " + sentryKey.keyId.toString() + ", pool: " + sentryKey.assignedPool.toHexString()+  " , TX: " + event.transaction.hash.toHexString(), []);
      return;
    }
    pool.totalAccruedAssertionRewards = pool.totalAccruedAssertionRewards.plus(reward)
    pool.save()
  }
}