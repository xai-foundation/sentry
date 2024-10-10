import { ethers } from 'ethers';
import { getProvider } from '../utils/getProvider.js';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';


export const getUserNodeLicenseBalance = async (walletAddress: string): Promise<BigInt> => {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Get the balance of the user
    const balance = await nodeLicenseContract.balanceOf(walletAddress);

    return balance;    
}
