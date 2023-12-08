import { ethers } from 'ethers';

// global storage of providers
const providers: { [url: string]: ethers.JsonRpcProvider } = {};

/**
 * Creates an ethers provider from a given RPC URL. If the same RPC URL is passed in, 
 * the same instance of the provider is returned (Singleton nature).
 * @param rpcUrl - The RPC URL. Defaults to Arbitrum One's public RPC.
 * @returns An ethers provider.
 */
export function getProvider(_rpcUrl: string = "https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ"): ethers.JsonRpcProvider {
    const rpcUrl = _rpcUrl;
    if (!providers[rpcUrl]) {
        providers[rpcUrl] = new ethers.JsonRpcProvider(rpcUrl);
    }
    return providers[rpcUrl];
}
