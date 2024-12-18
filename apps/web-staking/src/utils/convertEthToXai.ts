import { Web3Instance } from "@/services/web3.service";
import { getEthXaiExchangeRate } from "./getEthXaiExchangeRate";

/**
 * Converts a given amount of ETH to the equivalent amount of XAI and formats the result to the desired decimal places.
 * @param quantityOfEth - The quantity of ETH to convert to XAI, in wei.
 * @param formatToDecimals - The number of decimals to format the result to. Default is 18.
 * @returns The equivalent amount of XAI as a string formatted to the specified decimals.
 */
export async function convertEthToXai(
    web3Instance: Web3Instance,
    quantityOfEth: bigint,
    formatToDecimals: number = 18,
): Promise<{ amountOfXai: string }> {
    const { exchangeRate } = await getEthXaiExchangeRate(web3Instance);

    // Use a higher precision scale factor for intermediate calculations
    const precisionFactor = BigInt(1e6); // Add 6 extra decimals for precision
    const adjustedExchangeRate = exchangeRate * precisionFactor;

    const rawAmountOfXai = (quantityOfEth * adjustedExchangeRate) / BigInt(1e18);

    // Format the amount of XAI to the desired decimals
    const scaleFactor = BigInt(10 ** formatToDecimals);
    const formattedAmountOfXai = (rawAmountOfXai * scaleFactor) / precisionFactor;

    const integerPart = formattedAmountOfXai / scaleFactor;
    const fractionalPart = formattedAmountOfXai % scaleFactor;
    const fractionalStr = fractionalPart.toString().padStart(formatToDecimals, '0');

    return {
        amountOfXai: `${integerPart}.${fractionalStr}`,
    };
}
