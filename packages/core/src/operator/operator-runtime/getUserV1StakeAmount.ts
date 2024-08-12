import { getProvider } from '../../utils/getProvider.js';
import { RefereeAbi } from '../../abis/index.js';
import { config } from '../../config.js';
import { ethers } from 'ethers';
import { getUserNodeLicenseBalance } from '../../node-license/index.js';

/**
 * Get the V1 stake amount of a user
 * 
 * @param {string} walletAddress - The Ethereum address of the user.
 * @returns {Promise<bigint>} The v1 esXAI stake amount
 */
export const getUserV1StakeAmount = async (walletAddress: string): Promise<bigint> => {
    // Get the Ethereum provider
    const provider = getProvider();

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    // Claim the reward from the Referee contract
    const stakedAmount = await refereeContract.stakedAmounts(walletAddress);

    // Return only the requested number of keys
    return stakedAmount;
}