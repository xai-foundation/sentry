import { ethers } from 'ethers';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';
import { retry } from "../index.js";
import { StakingPoolAbi } from '../abis/StakingPoolAbi.js';

/**
 * Get the staked key count for a user
 * @param poolAddress - The address of the pool.
 * @param staker - The address of user that has keys staked.
 * @returns {number} - Count of staked keys
 */
export async function getUserStakedKeyCount(
    poolAddress: string,
    staker: string
): Promise<number> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the Pool contract
    const stakingPoolContract = new ethers.Contract(poolAddress, StakingPoolAbi, provider);

    //get staked keys of pool
    const stakedKeyCount = await retry(async () => await stakingPoolContract.getStakedKeysCountForUser(staker), 3);

    return Number(stakedKeyCount);
}
