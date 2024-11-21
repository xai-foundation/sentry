
import { config } from "@sentry/core";


/**
 * Retrieves the token address based on the currency type.
 * @param currency - The currency type (e.g., "XAI", "ESXAI").
 * @returns The token address as a string.
 */
export const getTokenAddress = (currency: string): string => {
  // Validate the provided currency
  if (!Object.values(CURRENCIES).includes(currency as Currency)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  // Check if config is properly set up
  if (!config.xaiAddress || !config.esXaiAddress || !config.usdcContractAddress) {
    throw new Error("Configuration error: Token addresses not found in config.");
  }

  switch (currency) {
    case CURRENCIES.AETH:
      //return zero address for eth
      return "0x0000000000000000000000000000000000000000";
    case CURRENCIES.XAI:
      return config.xaiAddress;
    case CURRENCIES.ES_XAI:
      return config.esXaiAddress;
    case CURRENCIES.USDC:
      return config.usdcContractAddress;
    default:
      throw new Error(`Unsupported currency: ${currency}`);
  }
};

// Define supported currencies as constants
export const CURRENCIES = {
  AETH: "AETH",
  XAI: "XAI",
  ES_XAI: "ESXAI",
  USDC: "USDC",
} as const;

// Define a type for supported currencies
export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];
