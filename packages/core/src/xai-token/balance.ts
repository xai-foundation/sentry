import { ethers } from 'ethers';
import { XaiAbi, esXaiAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';

/**
 * Returns the balance of Xai and esXai for an array of addresses.
 * @param addresses - The array of addresses to check the balance for.
 * @param callback - Optional callback function to handle addresses and their balances as they are retrieved.
 * @returns An array of objects, each containing an address and its Xai and esXai balances.
 */
export async function getBalances(
    addresses: string[],
    callback?: (address: string, xaiBalance: bigint, esXaiBalance: bigint) => void
): Promise<{ address: string, xaiBalance: bigint, esXaiBalance: bigint }[]> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the esXai contract
    const esXaiContract = new ethers.Contract(config.esXaiAddress, esXaiAbi, provider);

    // Create an instance of the Xai contract
    const xaiContract = new ethers.Contract(config.xaiAddress, XaiAbi, provider);

    // Get the balances of Xai and esXai for all addresses
    const balances = [];
    for (const address of addresses) {
        const xaiBalance = await xaiContract.balanceOf(address);
        const esXaiBalance = await esXaiContract.balanceOf(address);
        balances.push({ address, xaiBalance, esXaiBalance });
        if (callback) {
            callback(address, xaiBalance, esXaiBalance);
        }
    }

    return balances;
}
