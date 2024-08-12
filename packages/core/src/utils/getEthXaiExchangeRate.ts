import {ethers} from 'ethers';
import {getProvider} from '../utils/getProvider.js';
import { config } from '../index.js';

/**
 * Fetches the eth price from chainlink and then the xai price from chainlink.
 * @param quantityOfEth - The quantity of eth to convert to xai.
 * @returns The exchange rate of eth to xai.
 */

export async function getEthXaiExchangeRate(): Promise<{ exchangeRate: bigint}> {
    
    const abi = ["function latestAnswer() external view returns (int256)"];

    // Get the provider
    const providerUrls = [
        config.arbitrumOneJsonRpcUrl,
        config.publicRPC,
    ];
    const provider = getProvider(providerUrls[Math.floor(Math.random() * providerUrls.length)]);

    // Create an instance of the Chainlink price feed contract
    const ethPriceFeedContract = new ethers.Contract(config.chainlinkEthUsdPriceFeed, abi, provider);

    // Get the latest round data from the Chainlink price feed contract
    const ethPriceFeedData = await ethPriceFeedContract.latestAnswer();

    // Get the eth price from the latest round data
    const ethPrice = BigInt(ethPriceFeedData.toString());
    // Create an instance of the Chainlink price feed contract
    const xaiPriceFeedContract = new ethers.Contract(config.chainlinkXaiUsdPriceFeed, abi, provider);

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