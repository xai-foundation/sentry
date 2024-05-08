import { ethers } from 'ethers';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';
import { retry } from "../index.js";
import { PoolFactoryAbi } from '../abis/PoolFactoryAbi.js';
import { StakingPoolAbi } from '../abis/StakingPoolAbi.js';

/**
 * Fetches all pools the ownerAddress is either owner of or delegated operator of.
 * @param ownerAddress - The address of the owner.
 * @returns An array of pool addresses.
 */
export async function getUserInteractedPools(
    ownerAddress: string
): Promise<string[]> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the FactoryContract contract
    const factoryContract = new ethers.Contract(config.poolFactoryAddress, PoolFactoryAbi, provider);

    // Get the balance of the owner's address
    const userPoolAddresses: string[] = await retry(async () => await factoryContract.getPoolIndicesOfUser(ownerAddress));

    return userPoolAddresses;
}
