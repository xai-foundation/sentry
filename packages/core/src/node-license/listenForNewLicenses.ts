import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/NodeLicenseAbi.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';

/**
 * Listens for new NodeLicense tokens being transferred and calls a callback function. This includes mints and other transfer events.
 * @param callback - The callback function to call when a new token is transferred.
 * @param addresses - Optional array of addresses to filter the transfers by recipient.
 * @returns A function to stop listening for new transfers.
 */
export async function listenForNewLicenses(
    callback: (tokenId: bigint, recipient: string) => void,
    addresses?: string[]
): Promise<() => void> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Define the event filter
    const filter = nodeLicenseContract.filters.Transfer(null, null, null);

    // Define the event listener
    const listener = (from: string, to: string, tokenId: bigint) => {
        if (!addresses || addresses.includes(to)) {
            callback(tokenId, to);
        }
    };

    // Attach the event listener
    nodeLicenseContract.on(filter, listener);

    // Return a function to stop listening for new transfers
    return () => {
        nodeLicenseContract.off(filter, listener);
    };
}

