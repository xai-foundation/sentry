import { ethers } from "ethers";
import { config, NodeLicenseAbi } from "../index.js";

/**
 * Sets the referral discount and reward percentages in the NodeLicense contract.
 *
 * @param signer - The ethers.js signer to use.
 * @param referralDiscountPercentage - The new referral discount percentage.
 * @param referralRewardPercentage - The new referral reward percentage.
 * @returns A promise that resolves to the transaction receipt.
 */
export async function setDiscountAndRewardForReferrals(
    signer: ethers.Signer, 
    referralDiscountPercentage: number, 
    referralRewardPercentage: number
) {
    // Create a contract instance
    const contract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, signer);

    // Call the setReferralPercentages function
    const tx = await contract.setReferralPercentages(referralDiscountPercentage, referralRewardPercentage);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    return receipt;
}