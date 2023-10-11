import { ethers } from 'ethers';
import { esXaiAbi } from '../abis';
import { config } from '../config';
import { getProvider } from '../utils/getProvider';

/**
 * Checks if the provided addresses are in the whitelist.
 * @param addresses - The addresses to check.
 * @param callback - Optional callback function to handle addresses and their whitelist status as they are retrieved.
 * @returns An array of objects, each containing an address and its whitelist status.
 */
export async function checkWhitelist(
    addresses: string[],
    callback?: (address: string, isWhitelisted: boolean) => void
): Promise<{address: string, isWhitelisted: boolean}[]> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the esXai contract
    const esXaiContract = new ethers.Contract(config.esXaiAddress, esXaiAbi, provider);

    // Check the whitelist status of all addresses
    const whitelistStatuses = [];
    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const isWhitelisted = await esXaiContract.isWhitelisted(address);
        whitelistStatuses.push({address, isWhitelisted});
        if (callback) {
            callback(address, isWhitelisted);
        }
    }

    return whitelistStatuses;
}
