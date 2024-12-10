import { getEthUsdcExchangeRate } from "@sentry/core";

/**
 * Converts an amount of ETH (in wei) to its equivalent value in USDC or another specified precision.
 * 
 * @async
 * @param {bigint} ethAmountInWei - The amount of ETH in wei (18 decimal places).
 * @param {number} [outputDecimals=6] - The number of decimal places for the output (default is 6, for USDC precision).
 * @returns {Promise<bigint>} The equivalent amount in the specified decimal precision.
 * 
 */
export const convertEthAmountToUsdcAmount = async (
    ethAmountInWei: bigint,
    outputDecimals: number = 6
): Promise<bigint> => {
    // 1. Get Eth USDC Price From Oracle
    const { exchangeRate } = await getEthUsdcExchangeRate();

    // 2. Multiply ETH amount (18 decimals) by exchange rate (18 decimals)
    const multiplication = ethAmountInWei * exchangeRate;

    // 3. Divide by 10^18 because multiplication of two 18 decimal numbers gives 36 decimals
    const normalizedAmount = multiplication / BigInt(10n ** 18n);

    // 4. Divide by 10^(18 - outputDecimals) to adjust precision
    const adjustmentFactor = BigInt(10n ** BigInt(18 - outputDecimals));
    const adjustedAmount = normalizedAmount / adjustmentFactor;

    return adjustedAmount;
};
