import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../index.js';

/**
 * @typedef {Object} PromoCode
 * @property {string} recipient - The recipient address.
 * @property {boolean} active - The status of the promo code.
 * @property {bigint} receivedLifetime - The total amount received from this promo code.
 */
export interface PromoCode {
    recipient: string;
    active: boolean;
    receivedLifetime: bigint;
}

/**
 * Fetches the details of a given promo code.
 * @param promoCode - The promo code.
 * @returns The promo code details.
 */
export async function getPromoCode(promoCode: string): Promise<PromoCode> {
    const provider = getProvider();
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);
    const promoCodeDetails = await nodeLicenseContract.getPromoCode(promoCode);
    return promoCodeDetails;
}
