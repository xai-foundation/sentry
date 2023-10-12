import { ethers } from "ethers";
import { esXaiAbi } from "../abis/index.js";
import { config } from "../config.js";

/**
 * Changes the whitelist status of an object of wallets in the esXai contract.
 *
 * @param signer - The signer with DEFAULT_ADMIN_ROLE.
 * @param walletsStatuses - Object with wallet addresses as keys and their whitelist status as values.
 * @param callback - Optional callback function to handle wallets and their whitelist status as they are processed.
 * @returns An array of objects, each containing a wallet address and its new whitelist status.
 */
export async function changeWhitelistStatus(
    signer: ethers.Signer,
    walletsStatuses: { [wallet: string]: boolean },
    callback?: (wallet: string, isWhitelisted: boolean) => void
): Promise<{wallet: string, isWhitelisted: boolean}[]> {

    // Create a contract instance
    const contract = new ethers.Contract(config.esXaiAddress, esXaiAbi, signer);

    // Change the whitelist status of each wallet
    const whitelistStatuses = [];
    for (const wallet in walletsStatuses) {
        const status = walletsStatuses[wallet];
        const currentStatus = await contract.isWhitelisted(wallet);
        if (status !== currentStatus) {
            if (status) {
                await contract.addToWhitelist(wallet);
            } else {
                await contract.removeFromWhitelist(wallet);
            }
            whitelistStatuses.push({wallet, isWhitelisted: status});
            if (callback) {
                callback(wallet, status);
            }
        }
    }

    return whitelistStatuses;
}
