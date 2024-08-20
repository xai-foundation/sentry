import { ethers } from 'ethers';
import { getProvider } from '../utils/getProvider.js';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../index.js';

/**
 * Fetches the public key of the challenger from the Referee contract.
 *
 * This function initializes an Ethereum provider using `getProvider()`, then
 * creates a contract instance for the Referee contract using its ABI and address.
 * It then retrieves the public key of the challenger by calling the `challengerPublicKey`
 * function on the contract.
 *
 * @async
 * @function getChallengerPublicKey
 * @returns {Promise<string>} The public key of the challenger.
 * @throws {Error} If the contract call fails or the provider is not correctly initialized.
 */
export async function getChallengerPublicKey(): Promise<string> {

    const provider = getProvider();

    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    const challengerPublicKey = await refereeContract.challengerPublicKey();

    return challengerPublicKey;
}
