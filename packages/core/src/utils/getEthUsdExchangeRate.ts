import {ethers} from 'ethers';
import {getProvider} from '../utils/getProvider.js';
import { config } from '../index.js';

/**
 * Fetches the eth price from chainlink.
 * @returns The exchange rate of eth to usd.
 */
export async function getEthUsdExchangeRate(): Promise<{ exchangeRate: bigint}> {
    
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

    //Price feed returns 8 decimals, truncate last 2 decimals to get 6 for USDC
    // const ethPriceAdjusted = ethPrice / BigInt(1e6);
    // const ethPriceAdjusted = ethPrice * BigInt(1e10);
    // console.log(`>>> ethPriceAdjusted: ${ethPriceAdjusted}`);

    return { exchangeRate: ethPrice };
}