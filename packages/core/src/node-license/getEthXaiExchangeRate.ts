import {ethers} from 'ethers';
import {NodeLicenseAbi} from '../abis/index.js';
import {config} from '../config.js';
import {getProvider} from '../utils/getProvider.js';
import {listTiers} from './listTiers.js';

/**
 * Fetches the eth price from chainlink and then the xai price from chainlink.
 * @param quantityOfEth - The quantity of eth to convert to xai.
 * @returns The exchange rate of eth to xai.
 */

export async function getEthXaiExchangeRate(): Promise<{ exchangeRate: bigint}> {
    const ETH_FEED_ADDRESS = '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612'; //TODO Move to Config File
    const XAI_FEED_ADDRESS = '0x806c532D543352e7C344ba6C7F3F00Bfbd309Af1'; //TODO Move to Config File
    const abi = ["function latestAnswer() external view returns (int256)"];

    // Get the provider
    const providerUrls = [
        "https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ",
        "https://arb1.arbitrum.io/rpc",
    ];
    const provider = getProvider(providerUrls[Math.floor(Math.random() * providerUrls.length)]);

    // Create an instance of the Chainlink price feed contract
    const ethPriceFeedContract = new ethers.Contract(ETH_FEED_ADDRESS, abi, provider);

    // Get the latest round data from the Chainlink price feed contract
    const ethPriceFeedData = await ethPriceFeedContract.latestAnswer();

    // Get the eth price from the latest round data
    const ethPrice = BigInt(ethPriceFeedData.toString());
    // Create an instance of the Chainlink price feed contract
    const xaiPriceFeedContract = new ethers.Contract(XAI_FEED_ADDRESS, abi, provider);

    // Get the latest round data from the Chainlink price feed contract
    const xaiPriceFeedData = await xaiPriceFeedContract.latestAnswer();

    // Get the XAI price from the latest round data
    const xaiPrice = BigInt(xaiPriceFeedData.toString());

    // Both prices are in 8 decimal format, so we adjust by multiplying by 10^10 to scale to 18 decimals
    const ethPriceAdjusted = ethPrice * BigInt(1e10);
    const xaiPriceAdjusted = xaiPrice * BigInt(1e10);

    // Calculate the exchange rate of eth to xai
    const exchangeRate =  ethPriceAdjusted / xaiPriceAdjusted;

    return { exchangeRate };
}