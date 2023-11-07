import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';

/**
 * Fetches the owner addresses from the NodeLicense contract.
 * @param tokenIds - The IDs of the tokens.
 * @param callback - Optional callback function to handle owner addresses as they are retrieved.
 * @returns The owner addresses.
 */
export async function getOwnerOfNodeLicense(
    tokenIds: bigint[],
    callback?: (ownerAddress: string) => void
): Promise<string[]> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Get the owner addresses
    const ownerAddresses = [];
    for (const tokenId of tokenIds) {
        const ownerAddress = await nodeLicenseContract.ownerOf(tokenId);
        ownerAddresses.push(ownerAddress);
        if (callback) {
            callback(ownerAddress);
        }
    }

    return ownerAddresses;
}


