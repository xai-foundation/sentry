import { getProvider } from '../utils/getProvider.js';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';
import { ethers } from 'ethers';
import { retry } from './retry.js';

/**
 * Fetches the referee calculations address.
 */
export const getRefereeCalculationsAddress = async (): Promise<string> => {
    const provider = getProvider(); //  Get the Ethereum provider
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider); // Create an instance of the Referee contract
    const address = await retry(async () => refereeContract.refereeCalculationsAddress(), 3);
    return address; // Return the fetched referee calculations address
}