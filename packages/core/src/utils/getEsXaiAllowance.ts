import {ethers} from 'ethers';
import {getProvider} from '../utils/getProvider.js';
import { XaiAbi } from '../abis/index.js';
import { config } from '../index.js';

/**
 * Fetches the allowance amount of esXai token for a wallet and operator.
 * @param wallet - The address of the wallet to fetch the allowance of.
 * @param operator - The address of the operator.
 * @returns bigint The approval amount of the wallet.
 */

export async function getEsXaiAllowance(wallet: string, operator: string): Promise<{ approvalAmount: bigint}> {
    if(!wallet || !operator || wallet.length !== 42 || operator.length !== 42) {
        return { approvalAmount: BigInt(0) };
    }

    // Get the provider
    const providerUrls = [
        config.arbitrumOneJsonRpcUrl,
        config.publicRPC,
    ];
    const provider = getProvider(providerUrls[Math.floor(Math.random() * providerUrls.length)]);

    // Create an instance of the esXai token contract
    const tokenContract = new ethers.Contract(config.esXaiAddress, XaiAbi, provider);

    // Get the operator allowance of the esXai token
    const approvalAmount = await tokenContract.allowance(wallet, operator);

    return { approvalAmount };
}