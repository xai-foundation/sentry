import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../index.js';

/**
 * Get the current boostFactor for a key owner address
 * @param ownerPublicKey - The address of the owner of the key.
 */
export async function getBoostFactor(
    ownerPublicKey: string
): Promise<bigint> { 

    const provider = getProvider();

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    //Read the stakers boostFactor from the Referee contract
    return await refereeContract.getBoostFactorForStaker(
        ownerPublicKey
    );
}
