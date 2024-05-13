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
export async function getOwnerOrDelegatePools(
    ownerAddress: string
): Promise<string[]> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the FactoryContract contract
    const factoryContract = new ethers.Contract(config.poolFactoryAddress, PoolFactoryAbi, provider);

    // Get the balance of the owner's address
    const userPoolAddresses: string[] = await retry(async () => await factoryContract.getPoolIndicesOfUser(ownerAddress));

    // Initialize an array to store the token IDs
    const ownerPoolAddresses: string[] = [];

    // Loop through the userInteractedPools and pool address of each pool where operator is owner
    for (let index = 0; index < userPoolAddresses.length; index++) {
        const stakingPoolContract = new ethers.Contract(userPoolAddresses[index], StakingPoolAbi, provider);

        // Get userStaked keys for each pool where is poolOwner is owner
        const poolOwner: string = await retry(async () => await stakingPoolContract.getPoolOwner());
        if (poolOwner == ownerAddress) {
            ownerPoolAddresses.push(userPoolAddresses[index]);
        }
    }

    const userDelegatedPoolAddresses: string[] = await retry(async () => await factoryContract.getDelegatePools(ownerAddress));

    // Merge both arrays
    const mergedPoolAddresses = [...ownerPoolAddresses, ...userDelegatedPoolAddresses];

    // Convert the merged array to a Set to remove duplicates
    const uniqueSetOfPoolAddresses = new Set(mergedPoolAddresses);

    // Convert the Set back to an array
    return Array.from(uniqueSetOfPoolAddresses);

}
