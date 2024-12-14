import { getEthXaiExchangeRate } from "@sentry/core";

/**
 * Converts an amount of ETH (in wei) to its equivalent value in USDC or another specified precision.
 *
 * @async
 * @param {bigint} ethAmountInWei - The amount of ETH in wei (18 decimal places).
 * @returns {Promise<bigint>} The equivalent amount in the specified decimal precision.
 *
 */
export const convertEthAmountToXaiAmount = async (
  ethAmountInWei: bigint
): Promise<bigint> => {
  // 1. Get Eth Xai Exchange Rate from Chainlink
  const { exchangeRate } = await getEthXaiExchangeRate();

  // 2. Multiply ETH amount by exchange rate
  const adjustedAmount = ethAmountInWei * exchangeRate;

  return adjustedAmount;
};
