import { BigInt } from "@graphprotocol/graph-ts";

export function getBoostFactor(
    stakedAmount: BigInt,
    stakeAmountTierThresholds: BigInt[],
    stakeAmountBoostFactors: BigInt[],
    refereeVersion: BigInt
): BigInt {

    if (refereeVersion.equals(BigInt.fromI32(1))) {
        return BigInt.fromI32(1);
    }

    if (stakedAmount.lt(stakeAmountTierThresholds[0])) {
        if (refereeVersion.equals(BigInt.fromI32(2))) {
            return BigInt.fromI32(1);
        } else {
            return BigInt.fromI32(100);
        }
    }

    for (let tier = 1; tier < stakeAmountTierThresholds.length; tier++) {
        if (stakedAmount.lt(stakeAmountTierThresholds[tier])) {
            return stakeAmountBoostFactors[tier - 1];
        }
    }
    return stakeAmountBoostFactors[stakeAmountTierThresholds.length - 1];
}