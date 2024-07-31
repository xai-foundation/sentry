import {ethers} from 'ethers';
import {NodeLicenseAbi} from '../abis/index.js';
import {config} from '../config.js';
import {getProvider} from '../utils/getProvider.js';
import {Tier} from './index.js';
import tierData from './tiers.json' assert { type: "json" };

/**
 * Pricing tier structure.
 */
export interface CheckoutTierSummary {
    pricePer: bigint;
    totalPriceForTier: bigint;
    quantity: bigint;
}

/**
 * Fetches the price for a given quantity of NodeLicenses and the number of nodes at each price.
 * @param quantity - The quantity of NodeLicenses.
 * @returns An object containing the price for the given quantity of NodeLicenses and a list of how many nodes are at each price.
 */
export async function getPriceForQuantity(quantity: number): Promise<{ price: bigint, nodesAtEachPrice: CheckoutTierSummary[] }> {

    // Get the provider
    const providerUrls = [
        "https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
        "https://arb1.arbitrum.io/rpc",
    ];
    const provider = getProvider(providerUrls[Math.floor(Math.random() * providerUrls.length)]);

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Get the price from the price() function in NodeLicense contract
    const contractPrice = await nodeLicenseContract.price(quantity, "");

    // Get the total supply of NodeLicenses
    let totalSupply = await nodeLicenseContract.totalSupply();

    // Get the pricing tiers from json file
    const tiers: Tier[] = tierData.map(tier => {
        return { price: BigInt(tier.price), quantity: BigInt(tier.quantity) };
    });

    // Initialize the price
    let price: bigint = 0n;

    // Initialize the list of how many nodes are at each price
    const nodesAtEachPrice: CheckoutTierSummary[] = [];

    // Calculate the price based on the tiers and the total supply
    let tierSum: bigint = 0n;
    for (const tier of tiers) {
        tierSum += tier.quantity;
        const availableInThisTier = tierSum > totalSupply
            ? tierSum - totalSupply
            : 0n;

        if (BigInt(quantity) <= availableInThisTier) {
            price += tier.price * BigInt(quantity);
            nodesAtEachPrice.push({ pricePer: tier.price, quantity: BigInt(quantity), totalPriceForTier: tier.price * BigInt(quantity) });
            break;
        } else {
            price += availableInThisTier * tier.price;
            nodesAtEachPrice.push({ pricePer: tier.price, quantity: availableInThisTier, totalPriceForTier: tier.price * availableInThisTier });
            quantity -= Number(availableInThisTier);
            totalSupply += availableInThisTier;
        }
    }

    // Check if the calculated price and contract price match
    if (price !== contractPrice) {
        throw new Error(`Calculated price (${price}) does not match contract price (${contractPrice}). There might have been a purchase during the calculation. Please recall this pricing function.`);
    }

    return { price: contractPrice, nodesAtEachPrice };
}

/**
 * Fetches the price for a given quantity of NodeLicenses and the number of nodes at each price.
 * @param quantity - The quantity of NodeLicenses.
 * @returns just the price for a given quantity with no breakdown
 */
export async function getPrice(quantity: number): Promise<{ price: bigint }> {

    // Get the provider
    const providerUrls = [
        "https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
        "https://arb1.arbitrum.io/rpc",
    ];
    const provider = getProvider(providerUrls[Math.floor(Math.random() * providerUrls.length)]);

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Get the price from the price() function in NodeLicense contract
    const contractPrice = await nodeLicenseContract.price(quantity, "");

    return { price: contractPrice };
}