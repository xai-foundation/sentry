import { SentryKey, SentryWallet, PoolInfo, RefereeConfig } from "@sentry/sentry-subgraph-client";

const getBoostFactor = (
    stakedAmount: bigint,
    stakeAmountTierThresholds: bigint[],
    stakeAmountBoostFactors: bigint[]
): bigint => {

    if (stakedAmount < stakeAmountTierThresholds[0]) {
        return BigInt(100)
    }

    for (let tier = 1; tier < stakeAmountTierThresholds.length; tier++) {
        if (stakedAmount < stakeAmountTierThresholds[tier]) {
            return stakeAmountBoostFactors[tier - 1];
        }
    }

    return stakeAmountBoostFactors[stakeAmountTierThresholds.length - 1];
}

/**
 * Looks up payout boostFactor based on the staking tier.
 * @return The payout chance boostFactor. 200 for double the chance.
 */
export const calculateBoostFactor_V1 = (sentryKey: SentryKey, sentryWallet: SentryWallet, mappedPools: { [poolAddress: string]: PoolInfo }, refereeConfig: RefereeConfig): bigint => {

    let stakeAmount = BigInt(sentryWallet.v1EsXaiStakeAmount);
    let keyCount = BigInt(sentryWallet.keyCount) - BigInt(sentryWallet.stakedKeyCount);

    if (sentryKey.assignedPool != "0x") {
        const pool = mappedPools[sentryKey.assignedPool]
        stakeAmount = BigInt(pool.totalStakedEsXaiAmount)
        keyCount = BigInt(pool.totalStakedKeyAmount)
    }

    const maxStakeAmount = keyCount * BigInt(refereeConfig.maxStakeAmountPerLicense);
    if (stakeAmount > maxStakeAmount) {
        stakeAmount = maxStakeAmount;
    }

    return getBoostFactor(
        stakeAmount,
        refereeConfig.stakeAmountTierThresholds.map(s => BigInt(s)),
        refereeConfig.stakeAmountBoostFactors.map(s => BigInt(s))
    )
}