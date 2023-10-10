import { ethers } from 'ethers';
import { XaiAbi, esXaiAbi } from '../abis';
import { config } from '../config';
import { getProvider } from '../utils/getProvider';

/**
 * Returns the total supply of tokens in circulation.
 * @returns An object that shows the total supply of esXai and Xai, and their total supply added together.
 */
export async function getTotalSupply(): Promise<{ esXaiTotalSupply: bigint, xaiTotalSupply: bigint, totalSupply: bigint }> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the esXai contract
    const esXaiContract = new ethers.Contract(config.esXaiAddress, esXaiAbi, provider);

    // Create an instance of the Xai contract
    const xaiContract = new ethers.Contract(config.xaiAddress, XaiAbi, provider);

    // Get the total supply of esXai
    const esXaiTotalSupply = await esXaiContract.totalSupply();

    // Get the total supply of Xai
    const xaiTotalSupply = await xaiContract.totalSupply();

    // Calculate the total supply
    const totalSupply = esXaiTotalSupply + xaiTotalSupply;

    return { esXaiTotalSupply, xaiTotalSupply, totalSupply };
}