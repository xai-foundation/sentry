import { getProvider } from '../utils/getProvider.js';
import { RefereeCalculationsAbi } from '../abis/index.js';
import { config } from '../config.js';
import { ethers } from 'ethers';

/**
 * Fetches the confirmation data for multiple challenge assertions from the Referee contract.
 * @param {string} refereeCalculationsAddress - The address of the Referee calculations contract.
 * @param {number[]} assertionIds - An array of assertion IDs for which confirmation data is required.
 * @returns {Promise<[string[], string]>} A promise that resolves to a tuple containing an array of `bytes32` confirmation data and a `bytes32` confirmation hash.
 */
export const getMultipleChallengeConfirmData = async (refereeCalculationsAddress: string, assertionIds: number[]): Promise<[string[], string]> => {
    
    // Get the Ethereum provider
    const provider = getProvider();

    // Create an instance of the Referee calculations contract
    const refereeCalculationsContract = new ethers.Contract(refereeCalculationsAddress, RefereeCalculationsAbi, provider);
    
    // Call the contract to retrieve confirmation data and hash for the provided assertion IDs
    const [confirmData, confirmHash]: [string[], string] = await refereeCalculationsContract.getConfirmDataMultipleAssertions(assertionIds, config.rollupAddress);

    // Return the fetched confirmation data and hash
    return [confirmData, confirmHash];
}