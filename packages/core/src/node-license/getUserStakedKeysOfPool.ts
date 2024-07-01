import { ethers } from 'ethers';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';
import { retry } from "../index.js";
import { StakingPoolAbi } from '../abis/StakingPoolAbi.js';

/**
 * Fetches all keys staked in a pool.
 * @param poolAddress - The address of the pool.
 * @param staker - The address of user that has keys staked.
 * @returns An array of key staked by the user.
 */
export async function getUserStakedKeysOfPool(
    poolAddress: string,
    staker: string
): Promise<bigint[]> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the Pool contract
    const stakingPoolContract = new ethers.Contract(poolAddress, StakingPoolAbi, provider);

    //get staked keys of pool
    const userPoolData = await retry(async () => await stakingPoolContract.getUserPoolData(staker), 3);

    return userPoolData[2];
}
