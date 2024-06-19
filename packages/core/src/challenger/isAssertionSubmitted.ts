import { ethers, keccak256 } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../index.js';

/**
 * Finds the last assertion event from the rollup contract and returns the nodeNum if not already written to referee contract
 * @return A promise of the last missed assertion or null
 */
export async function isAssertionSubmitted(nodeNum: bigint): Promise<boolean> {

    const provider = getProvider();
    const refereeContract = new ethers.Contract(
        config.refereeAddress,
        RefereeAbi,
        provider
    )
    const comboHash = keccak256(ethers.solidityPacked(['uint64', 'address'], [Number(nodeNum), ethers.getAddress(config.rollupAddress)]));
    const isSubmitted = await refereeContract.rollupAssertionTracker(comboHash);

    return isSubmitted;
}