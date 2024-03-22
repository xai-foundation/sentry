import { ethers } from 'ethers';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';
import { retry } from "../index.js";
import { StakingPoolAbi } from '../abis/StakingPoolAbi.js';

/**
 * Fetches all keys staked in a pool.
 * @param poolAddress - The address of the pool.
 * @returns An array of key IDs.
 */
export async function getKeysOfPool(
    poolAddress: string
): Promise<bigint[]> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the Pool contract
    const stakingPoolContract = new ethers.Contract(poolAddress, StakingPoolAbi, provider);

    //get staked keys of pool
    const stakedKeys: bigint[] = await retry(async () => await stakingPoolContract.getStakedKeys(), 3);

    return stakedKeys;

}
