import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../index.js';

/**
 * Fetches the details of a given promo code.
 * @param promoCode - The promo code.
 * @returns The promo code details.
 */
export async function getPromoCode(promoCode: string): Promise<any> {
    const provider = getProvider();
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);
    const promoCodeDetails = await nodeLicenseContract.getPromoCode(promoCode);
    return promoCodeDetails;
}
