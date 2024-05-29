import { RefereeAbi, config, getProvider } from "../index.js";
import { ethers, formatEther } from 'ethers';

/**
 * Get the current tier index by staked amount - in our databse the lowest tier is 0 = bronze.
 * Onchain we don't have an index for bronze, you will get the default boostFactor 100 if you are not at least in silver.
 * 
 * @param stakedAmount - The amount staked in the pool
 * @returns - The index of the tier, 0 for bronze, 1 for silver, 2 for gold, 3 for platinum, 4 for diamond 
 */
export function getTierIndexByStakedAmount(stakedAmount: number, tierThresholds: number[]): number {
    for (let i = 0; i < tierThresholds.length; i++) {
        if (stakedAmount < tierThresholds[i]) {
            return i; //If lower than gold, return 1 for silver
        }
    }
    return tierThresholds.length; //If staked amount is higher than highest tier, return 4 for diamond
}