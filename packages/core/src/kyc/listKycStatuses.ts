import { ethers } from "ethers";
import { getProvider } from "../utils/getProvider.js";
import { config } from "../config.js";
import { RefereeAbi } from "../abis/index.js";

/**
 * Lists all wallets and their KYC status in the Referee contract.
 *
 * @param callback - Optional callback function to handle wallets and their KYC status as they are retrieved.
 * @returns An array of objects, each containing a wallet address and its KYC status.
 */
export async function listKycStatuses(
    callback?: (wallet: string, isKycApproved: boolean) => void
): Promise<{wallet: string, isKycApproved: boolean}[]> {

    // Get the provider
    const provider = getProvider();

    // Create a contract instance
    const contract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    // Get the number of KYC'd wallets
    const walletCount = await contract.getKycWalletCount();

    // Get the addresses and KYC status of all wallets
    const kycStatuses = [];
    for (let i = 0; i < walletCount; i++) {
        const wallet = await contract.getKycWalletAtIndex(i);
        const isKycApproved = await contract.isKycApproved(wallet);
        kycStatuses.push({wallet, isKycApproved});
        if (callback) {
            callback(wallet, isKycApproved);
        }
    }

    return kycStatuses;
}
