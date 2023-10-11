import { ethers } from "ethers";
import { getProvider } from "../utils";
import { config } from "../config";
import { RefereeAbi } from "../abis";

/**
 * Checks the KYC status of an array of wallets in the Referee contract.
 *
 * @param wallets - Array of wallet addresses to check KYC status.
 * @param callback - Optional callback function to handle each wallet and its KYC status as they are retrieved.
 * @returns An array of objects, each containing a wallet address and its KYC status.
 */
export async function checkKycStatus(
    wallets: string[],
    callback?: (wallet: string, isKycApproved: boolean) => void
): Promise<{wallet: string, isKycApproved: boolean}[]> {

    // Get the provider
    const provider = getProvider();

    // Create a contract instance
    const contract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    // Check the KYC status of each wallet
    const kycStatuses = [];
    for (const wallet of wallets) {
        const isKycApproved = await contract.isKycApproved(wallet);
        kycStatuses.push({wallet, isKycApproved});
        if (callback) {
            callback(wallet, isKycApproved);
        }
    }

    return kycStatuses;
}
