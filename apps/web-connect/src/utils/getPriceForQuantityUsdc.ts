import { config,  NodeLicenseAbi } from '@sentry/core';
import {ethers} from 'ethers';

/**
 * Fetches the price for a given quantity of NodeLicenses.
 * @param quantity - The quantity of NodeLicenses.
 * @returns An object containing the total price in USDC.
 */
export async function getPriceForQuantityUsdc(quantity: number, promoCode: string): Promise<{ totalPrice: bigint }> {
    // Get the provider
    const providerUrls = [
        config.arbitrumOneJsonRpcUrl,
        config.publicRPC,
    ];
    const provider = new ethers.JsonRpcProvider(providerUrls[Math.floor(Math.random() * providerUrls.length)]);

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);
    const result = await nodeLicenseContract.getPriceInUSDC(quantity, promoCode); 

    return { totalPrice: result };
}

