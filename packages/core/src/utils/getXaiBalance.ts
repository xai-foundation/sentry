import {ethers} from 'ethers';
import {getProvider} from '../utils/getProvider.js';
import { XaiAbi } from '../abis/index.js';
import { config } from '../index.js';

/**
 * Fetches a wallet's Xai balance.
 * @param walletAddress - The address of the wallet to fetch the balance of.
 * @returns bigint The Xai balance of the wallet.
 */

export async function getXaiBalance(wallet: string): Promise<{ balance: bigint}> {
    if(!wallet || wallet.length !== 42) {
        return { balance: BigInt(0) };
    }

    // Get the provider
    const providerUrls = [ 
        config.arbitrumOneJsonRpcUrl,
        config.publicRPC,
    ];
    const provider = getProvider(providerUrls[Math.floor(Math.random() * providerUrls.length)]);

    // Create an instance of the Xai token contract
    const tokenContract = new ethers.Contract(config.xaiAddress, XaiAbi, provider);

    // Get the wallet balance of the Xai token
    const balance = await tokenContract.balanceOf(wallet);

    return { balance };
}