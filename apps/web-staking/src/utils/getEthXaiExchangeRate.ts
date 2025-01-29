import { Web3Instance } from '@/services/web3.service.js';
import { ChainlinkOracleAbi } from '@/assets/abi/ChainlinkOracleAbi';

/**
 * Fetches the eth price from chainlink and then the xai price from chainlink.
 * @param quantityOfEth - The quantity of eth to convert to xai.
 * @returns The exchange rate of eth to xai.
 */

export async function getEthXaiExchangeRate(web3Instance: Web3Instance): Promise<{ exchangeRate: bigint}> {

    const ethPriceFeedContract = new web3Instance.web3.eth.Contract(ChainlinkOracleAbi, web3Instance.ethPriceFeedAddress);;
    const ethPriceFeedData = await ethPriceFeedContract.methods.latestAnswer().call();

    // Get the eth price from the latest round data
    const ethPrice = BigInt(ethPriceFeedData.toString());

    // Create an instance of the Chainlink price feed contract
    const xaiPriceFeedContract = new web3Instance.web3.eth.Contract(ChainlinkOracleAbi, web3Instance.xaiPriceFeedAddress);

    // Get the latest round data from the Chainlink price feed contract
    const xaiPriceFeedData = await xaiPriceFeedContract.methods.latestAnswer().call();

    // Get the XAI price from the latest round data
    const xaiPrice = BigInt(xaiPriceFeedData.toString());

    // Both prices are in 8 decimal format, so we adjust by multiplying by 10^10 to scale to 18 decimals
    const ethPriceAdjusted = ethPrice * BigInt(1e10);
    const xaiPriceAdjusted = xaiPrice * BigInt(1e10);

    // Calculate the exchange rate of eth to xai
    const exchangeRate =  ethPriceAdjusted / xaiPriceAdjusted;

    return { exchangeRate };
}