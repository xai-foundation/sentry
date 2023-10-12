import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/NodeLicenseAbi.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';

/**
 * Fetches all NodeLicense token IDs owned by a given address.
 * @param ownerAddress - The address of the owner.
 * @param callback - Optional callback function to handle token IDs as they are retrieved.
 * @returns An array of token IDs.
 */
export async function listNodeLicenses(
    ownerAddress: string,
    callback?: (tokenId: bigint) => void
): Promise<bigint[]> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Get the balance of the owner's address
    const balance = await nodeLicenseContract.balanceOf(ownerAddress);

    // Initialize an array to store the token IDs
    const tokenIds: bigint[] = [];

    // Loop through the balance and fetch each token ID
    for (let i = 0; i < balance; i++) {
        const tokenId = await nodeLicenseContract.tokenOfOwnerByIndex(ownerAddress, i);
        tokenIds.push(tokenId);
        if (callback) {
            callback(tokenId);
        }
    }

    return tokenIds;
}
