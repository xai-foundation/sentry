import { BigInt } from "@graphprotocol/graph-ts";

export function getMaxStakeAmount(
    stakedAmount: BigInt,
    keyCount: BigInt,
    maxStakeAmountPerLicense: BigInt
): BigInt {

    const maxAmount = keyCount.times(maxStakeAmountPerLicense);
    if(stakedAmount > maxAmount){
        return maxAmount;
    }
    return stakedAmount;
}