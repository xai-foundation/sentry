import {ethers} from 'ethers';
import {getProvider} from '../utils/getProvider.js';
import { XaiAbi } from '../abis/index.js';

/**
 * Fetches the allowance amount of an erc20 token for a wallet and operator.
 * @param wallet - The address of the wallet to fetch the allowance of.
 * @param token - The address of the erc20 token.
 * @param operator - The address of the operator.
 * @returns bigint The approval amount of the wallet.
 */

export async function getErc20Allowance(wallet: string, token: string, operator: string): Promise<{ approvalAmount: bigint}> {
    if(!wallet || !token || !operator || wallet.length !== 42 || token.length !== 42 || operator.length !== 42) {
        throw new Error("Wallet, token, and operator addresses are required.");
    }

    // Get the provider
    const providerUrls = [
        "https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
        "https://arb1.arbitrum.io/rpc",
    ];
    const provider = getProvider(providerUrls[Math.floor(Math.random() * providerUrls.length)]);

    // Create an instance of an Erc20 token contract
    const tokenContract = new ethers.Contract(token, XaiAbi, provider);

    // Get the operator allowance of the erc20 token
    const approvalAmount = await tokenContract.allowance(wallet, operator);

    return { approvalAmount };
}