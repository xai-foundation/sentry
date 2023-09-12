import { ethers } from 'ethers';

/**
 * Creates an ethers provider from a given RPC URL.
 * @param rpcUrl - The RPC URL. Defaults to Arbitrum One's public RPC.
 * @returns An ethers provider.
 */
export function getProvider(rpcUrl: string = 'https://goerli-rollup.arbitrum.io/rpc'): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(rpcUrl);
}
