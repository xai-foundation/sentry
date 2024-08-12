import {ethers} from 'ethers';
import {getProvider} from '../utils/getProvider.js';
import { esXaiAbi } from '../abis/index.js';
import { config } from '../index.js';

/**
 * Fetches a wallet's esXai balance.
 * @param walletAddress - The address of the wallet to fetch the balance of.
 * @returns bigint The esXai balance of the wallet.
 */

export async function getEsXaiBalance(wallet: string): Promise<{ balance: bigint}> {
    if(!wallet || wallet.length !== 42) {
        return { balance: BigInt(0) };
    }

    // Get the provider
    const providerUrls = [
        config.arbitrumOneJsonRpcUrl,
        config.publicRPC,
    ];
    const provider = getProvider(providerUrls[Math.floor(Math.random() * providerUrls.length)]);

    // Create an instance of the esXai token contract
    const tokenContract = new ethers.Contract(config.esXaiAddress, esXaiAbi, provider);

    // Get the wallet balance of the esXai token
    const balance = await tokenContract.balanceOf(wallet);

    return { balance };
}