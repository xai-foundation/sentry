import { ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';
import { listTiers } from './listTiers.js';

/**
 * Pricing tier structure.
 */
interface Tier {
    price: bigint;
    quantity: bigint;
}

/**
 * Fetches the price for a given quantity of NodeLicenses and the number of nodes at each price.
 * @param quantity - The quantity of NodeLicenses.
 * @returns An object containing the price for the given quantity of NodeLicenses and a list of how many nodes are at each price.
 */
export async function getPriceForQuantity(quantity: number): Promise<{ price: bigint, nodesAtEachPrice: Tier[] }> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Get the total supply of NodeLicenses
    const totalSupply = await nodeLicenseContract.totalSupply();

    // Get the pricing tiers
    const tiers = await listTiers()

    // Initialize the price
    let price: bigint = 0n;

    // Initialize the list of how many nodes are at each price
    const nodesAtEachPrice: Tier[] = [];

    // Calculate the price based on the tiers and the total supply
    for (const tier of tiers) {
        if (totalSupply + quantity <= tier.quantity) {
            price = tier.price * BigInt(quantity);
            nodesAtEachPrice.push({ price: tier.price, quantity: BigInt(quantity) });
            break;
        } else if (totalSupply < tier.quantity) {
            const quantityInTier = tier.quantity - totalSupply;
            price += tier.price * BigInt(quantityInTier);
            nodesAtEachPrice.push({ price: tier.price, quantity: BigInt(quantityInTier) });
            quantity -= Number(quantityInTier);
        }
    }

    // Get the price from the price() function in NodeLicense contract
    const contractPrice = await nodeLicenseContract.price(quantity);

    // Check if the calculated price and contract price match
    if (price !== contractPrice) {
        throw new Error(`Calculated price (${price}) does not match contract price (${contractPrice}). There might have been a purchase during the calculation. Please recall this pricing function.`);
    }

    return { price: contractPrice, nodesAtEachPrice };
}