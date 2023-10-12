import { ethers } from "ethers";
import { getProvider } from "../utils/getProvider.js";
import { config } from "../config.js";
import { esXaiAbi } from "../abis/index.js";

/**
 * Lists all whitelisted addresses in the esXai contract.
 *
 * @param callback - Optional callback function to handle whitelisted addresses as they are retrieved.
 * @returns An array of whitelisted addresses.
 */
export async function listWhitelistAddresses(
    callback?: (address: string) => void
): Promise<string[]> {

    // Get the provider
    const provider = getProvider();

    // Create a contract instance
    const contract = new ethers.Contract(config.esXaiAddress, esXaiAbi, provider);

    // Get the number of whitelisted addresses
    const whitelistCount = await contract.getWhitelistCount();

    // Get all whitelisted addresses
    const whitelistAddresses = [];
    for (let i = 0; i < whitelistCount; i++) {
        const address = await contract.getWhitelistedAddressAtIndex(i);
        whitelistAddresses.push(address);
        if (callback) {
            callback(address);
        }
    }

    return whitelistAddresses;
}
