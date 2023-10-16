import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';

/**
 * Fetches the total supply and max supply of tokens from the NodeLicense contract.
 * @returns An object containing the total supply and max supply of tokens.
 */
export async function getTotalSupplyAndCap(): Promise<{ totalSupply: bigint, maxSupply: bigint }> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Get the total supply of tokens
    const totalSupply = await nodeLicenseContract.totalSupply();

    // Get the max supply of tokens
    const maxSupply = await nodeLicenseContract.maxSupply();

    return {
        totalSupply,
        maxSupply
    };
}
