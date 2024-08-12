import { getProvider } from '../../utils/getProvider.js';
import { RefereeAbi } from '../../abis/index.js';
import { config } from '../../config.js';
import { ethers } from 'ethers';
import { getUserNodeLicenseBalance } from '../../node-license/index.js';

/**
 * Get the unstaked key count for a user's wallet address.
 * 
 * @param {string} walletAddress - The Ethereum address of the user.
 * @returns {Promise<number>} The count of unstaked keys of the user
 */
export const getUnStakedKeysOfUser = async (walletAddress: string): Promise<number> => {
    // Get the Ethereum provider
    const provider = getProvider();

    // Get the total number of node licenses for the user
    const numNodeLicenses = await getUserNodeLicenseBalance(walletAddress)

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    // Claim the reward from the Referee contract
    const stakedKeysCount = await refereeContract.assignedKeysOfUserCount(walletAddress);

    // Return only the requested number of keys
    return Number(numNodeLicenses) - Number(stakedKeysCount);
}