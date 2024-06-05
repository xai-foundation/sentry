import { RefereeAbi, config, getProvider } from "../index.js";
import { ethers, formatEther } from 'ethers';

//We might want to cache that for a specific amount of time to not keep reading this from the Referee on every pool update.

/**
 * Load max stake per key from Referee
 */
export async function getMaxStakeAmountPerLicense(): Promise<number> {
    const provider = getProvider();
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);
    const maxStake = await refereeContract.maxStakeAmountPerLicense();
    return Number(formatEther(maxStake.toString()))
}
