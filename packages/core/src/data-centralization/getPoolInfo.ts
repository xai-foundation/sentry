import { RawPoolInfo } from "./types.js";
import { StakingPoolAbi } from "../abis/StakingPoolAbi.js";
import { getProvider } from "../index.js";
import { ethers } from 'ethers';

/**
 * Loads the current Pool Data from the blockchain
 * @param poolAddress - The pool address to sync.
 */
export async function getPoolInfo(
    poolAddress: string
): Promise<RawPoolInfo> {
    const provider = getProvider();

    const stakingPoolContract = new ethers.Contract(poolAddress, StakingPoolAbi, provider);
    const rawPoolInfo = await stakingPoolContract.getPoolInfo() as RawPoolInfo;

    return rawPoolInfo;
}
