import { BigInt } from "@graphprotocol/graph-ts";

export function getBoostFactor(
    stakedAmount: BigInt,
    stakeAmountTierThresholds: BigInt[],
    stakeAmountBoostFactors: BigInt[]
): BigInt {

    if (stakedAmount < stakeAmountTierThresholds[0]) {
        return BigInt.fromI32(100);
    }

    const length = stakeAmountTierThresholds.length;
    for (let tier = 1; tier < length; tier++) {
        if (stakedAmount < stakeAmountTierThresholds[tier]) {
            return stakeAmountBoostFactors[tier - 1];
        }
    }
    return stakeAmountBoostFactors[length - 1];
}