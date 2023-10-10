import { ethers } from "ethers";
import { getProvider } from "../utils";
import { config } from "../config";
import { RefereeAbi } from "../abis";
import { checkKycStatus } from "./checkKycStatus";

/**
 * Sets the KYC status of an object of wallets in the Referee contract.
 *
 * @param signer - The signer with KYC_ADMIN_ROLE.
 * @param walletsStatuses - Object with wallet addresses as keys and their KYC status as values.
 * @param callback - Optional callback function to handle wallets and their KYC status as they are processed.
 * @returns An array of objects, each containing a wallet address and its new KYC status.
 */
export async function setKycStatus(
    signer: ethers.Signer,
    walletsStatuses: { [wallet: string]: boolean },
    callback?: (wallet: string, isKycApproved: boolean) => void
): Promise<{wallet: string, isKycApproved: boolean}[]> {

    // Create a contract instance
    const contract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Set the KYC status of each wallet
    const kycStatuses = [];
    for (const wallet in walletsStatuses) {
        const status = walletsStatuses[wallet];
        const currentStatus = await checkKycStatus([wallet]);
        if (status !== currentStatus[0].isKycApproved) {
            if (status) {
                await contract.addKycWallet(wallet);
            } else {
                await contract.removeKycWallet(wallet);
            }
            kycStatuses.push({wallet, isKycApproved: status});
            if (callback) {
                callback(wallet, status);
            }
        }
    }

    return kycStatuses;
}
