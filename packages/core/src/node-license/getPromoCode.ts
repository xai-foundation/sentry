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
    const promoCodeIsActive = promoCodeDetails[1];

    // If the promo code is active, return the details
    if(promoCodeIsActive){
        return promoCodeDetails;
    }
    
    // Otherwise Check if the promo code is an address that owns a node license
    // If this is the case, it means the promo code has not been used yet
    // This will return the zero address if the promo code is not an address
    const promoIsAnAddress = ethers.isAddress(promoCode)

    // If the promo code is an address
    if(promoIsAnAddress){ 

        //Check if the address owns a node license
        const balance = await nodeLicenseContract.balanceOf(promoCode);

        // If the address owns a node license
        if(balance>0){

            // Create the promo code details object
            const promoCodeDetails = {
                recipient: promoCode,
                active: true,
                receivedLifetime: 0n
            }

            return promoCodeDetails;
        }
    }
    
    // If the promo code is not active and is not an address that owns a node license, return the original details
    // This will return zeroes if the promo code is not valid
    // If it is valid but not active, it will return the original details
    return promoCodeDetails
}
