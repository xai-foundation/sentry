

// Define supported currencies as constants
export const CURRENCIES = {
  AETH: "AETH",
  XAI: "XAI",
  ES_XAI: "ESXAI",
} as const;

// Define a type for supported currencies
export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];
