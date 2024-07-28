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

/**
 * Fetches all pools the ownerAddresses are either owner of or delegated operator of.
 * @param ownerAddresses - The addresses of the owners.
 * @returns An array of pool addresses.
 */

export async function getMultipleUsersInteractedPoolsRpc(
    ownerAddresses: string[]
): Promise<string[]> {
    const uniquePoolAddresses = new Set<string>();

    for (const ownerAddress of ownerAddresses) {
        const pools = await getUserInteractedPools(ownerAddress);
        pools.forEach(pool => uniquePoolAddresses.add(pool));
    }

    return Array.from(uniquePoolAddresses);
}
