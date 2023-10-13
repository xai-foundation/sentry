import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';

/**
 * Pricing tier structure.
 */
interface Tier {
    price: bigint;
    quantity: bigint;
}

/**
 * Fetches all pricing tiers from the NodeLicense contract.
 * @param callback - Optional callback function to handle tiers as they are retrieved.
 * @returns An array of pricing tiers.
 */
export async function listTiers(callback?: (tier: Tier) => void): Promise<Tier[]> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Initialize an array to store the pricing tiers
    const tiers: Tier[] = [];

    // Get the total number of pricing tiers
    const totalTiers = await nodeLicenseContract.pricingTiers.length;

    // Loop through the totalTiers and fetch each tier
    for (let i = 0; i < totalTiers; i++) {
        const tier = await nodeLicenseContract.getPricingTier(i);
        tiers.push({
            price: tier.price,
            quantity: tier.quantity
        });
        if (callback) {
            callback(tier);
        }
    }

    return tiers;
}
