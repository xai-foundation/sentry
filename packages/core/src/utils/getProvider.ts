import { ethers } from 'ethers';
import { config } from '../config';

/**
 * Creates an ethers provider from a given RPC URL.
 * @param rpcUrl - The RPC URL. Defaults to Arbitrum One's public RPC.
 * @returns An ethers provider.
 */
export function getProvider(rpcUrl: string = config.defaultRpcUrl): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(rpcUrl);
}
