import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';

/**
 * Fetches the referral discount and reward percentages from the NodeLicense contract.
 * @returns An object containing the referral discount and reward percentages.
 */
export async function getDiscountAndRewardForReferrals(): Promise<{ referralDiscountPercentage: bigint, referralRewardPercentage: bigint }> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Get the referral discount percentage
    const referralDiscountPercentage = await nodeLicenseContract.referralDiscountPercentage();

    // Get the referral reward percentage
    const referralRewardPercentage = await nodeLicenseContract.referralRewardPercentage();

    return {
        referralDiscountPercentage,
        referralRewardPercentage
    };
}
