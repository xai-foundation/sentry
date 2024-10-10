import { getProvider } from '../utils/getProvider.js';
import { PoolFactoryAbi } from '../abis/index.js';
import { config } from '../config.js';
import { ethers } from 'ethers';
import { getUserNodeLicenseBalance } from './index.js';

/**
 * Retrieves a specified number of unstaked keys for a given user.
 * 
 * @param {string} walletAddress - The Ethereum address of the user.
 * @returns {Promise<BigInt[]>} A promise that resolves to an array of BigInt representing unstaked key IDs.
 */
export const getUnStakedKeysOfUser = async (walletAddress: string): Promise<bigint[]> => {
    // Get the Ethereum provider
    const provider = getProvider();

    // Create an instance of the Pool Factory contract
    const poolFactoryContract = new ethers.Contract(config.poolFactoryAddress, PoolFactoryAbi, provider);

    // Get the total number of node licenses for the user
    const numNodeLicenses = await getUserNodeLicenseBalance(walletAddress) as bigint;

    // Initialize an array to store the available unstaked keys
    const availableKeys: bigint[] = [];

    try {
        // Initialize the offset for pagination
        let offset = 0n;

        // Loop until we have collected the requested number of keys or exhausted all licenses
        while (availableKeys.length < numNodeLicenses) {
            // Fetch a batch of 10 unstaked keys starting from the current offset
            const keys = await poolFactoryContract.getUnstakedKeyIdsFromUser(walletAddress, BigInt(offset), BigInt(500)) as bigint[];

            // Filter out any zero values and add valid keys to the availableKeys array
            keys.forEach(k => {
                if (Number(k) != 0) {
                    availableKeys.push(k);
                }
            });

            // Increase the offset by 10 for the next batch
            offset += 10n;

            // Break the loop if we've checked all node licenses
            if (offset >= numNodeLicenses) {
                break;
            }
        }
    } catch (error) {
        // Log any errors that occur during the process
        console.error("Failed to load unstaked keys", error);
    }

    // Return only the requested number of keys
    return availableKeys;
}