import {ethers} from 'ethers';
import {getProvider} from '../utils/getProvider.js';
import { XaiAbi } from '../abis/index.js';

/**
 * Fetches a wallet's erc20 balance.
 * @param walletAddress - The address of the wallet to fetch the balance of.
 * @param erc20Address - The address of the erc20 token.
 * @returns bigint The balance of the wallet.
 */

export async function getErc20Balance(wallet: string, token: string): Promise<{ balance: bigint}> {
    if(!wallet || !token || wallet.length !== 42 || token.length !== 42) {
        throw new Error("Wallet and token addresses are required.");
    }

    // Get the provider
    const providerUrls = [
        "https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
        "https://arb1.arbitrum.io/rpc",
    ];
    const provider = getProvider(providerUrls[Math.floor(Math.random() * providerUrls.length)]);

    // Create an instance of an Erc20 token contract
    const tokenContract = new ethers.Contract(token, XaiAbi, provider);

    // Get the wallet balance of the erc20 token
    const balance = await tokenContract.balanceOf(wallet);

    return { balance };
}