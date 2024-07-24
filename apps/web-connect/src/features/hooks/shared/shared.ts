
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
  if (!config.xaiAddress || !config.esXaiAddress) {
    throw new Error("Configuration error: Token addresses not found in config.");
  }

  return currency === CURRENCIES.XAI ? config.xaiAddress : config.esXaiAddress;
};

// Define supported currencies as constants
export const CURRENCIES = {
  AETH: "AETH",
  XAI: "XAI",
  ES_XAI: "ESXAI",
} as const;

// Define a type for supported currencies
export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];
