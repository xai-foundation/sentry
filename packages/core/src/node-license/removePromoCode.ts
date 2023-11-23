import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';

/**
 * Removes a promo code if the signer has the DEFAULT_ADMIN_ROLE.
 * @param promoCode - The promo code to remove.
 * @param signer - The signer to interact with the contract.
 * @returns The transaction receipt.
 */
export async function removePromoCode(
    promoCode: string,
    signer: ethers.Signer,
): Promise<ethers.TransactionReceipt> {

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, signer);

    // Remove the promo code
    const removePromoCodeTx = await nodeLicenseContract.removePromoCode(promoCode);

    // Wait for the transaction to be mined and get the receipt
    const txReceipt = await removePromoCodeTx.wait();

    return txReceipt;
}
