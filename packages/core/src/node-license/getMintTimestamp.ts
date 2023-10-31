import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';

/**
 * Fetches the mint timestamp from the NodeLicense contract.
 * @param tokenId - The ID of the token.
 * @returns The minting timestamp.
 */
export async function getMintTimestamp(tokenId: bigint): Promise<bigint> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Get the mint timestamp
    const mintTimestamp = await nodeLicenseContract.getMintTimestamp(tokenId);

    return mintTimestamp;
}
