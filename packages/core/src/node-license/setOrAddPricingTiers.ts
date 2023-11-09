import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';

/**
 * Function to set or add pricing tiers for node licenses.
 * @param index - The index of the tier to set or add.
 * @param price - The price of the tier.
 * @param quantity - The quantity of the tier.
 * @param signer - The signer to interact with the contract.
 */
export async function setOrAddPricingTiers(
    index: number,
    price: bigint,
    quantity: bigint,
    signer: ethers.Signer
): Promise<void> {

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, signer);

    // Set or add the pricing tier
    await nodeLicenseContract.setOrAddPricingTier(
        index,
        price,
        quantity
    );
}
