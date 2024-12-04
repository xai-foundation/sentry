import { useQuery } from "react-query";
import { getEthUsdcExchangeRate, getEthXaiExchangeRate } from "@sentry/core";
import { Currency } from "../shared";

// Define TypeScript type for better type safety
interface ExchangeRate {
  exchangeRate: bigint; 
}

/**
 * Custom hook to fetch the ETH to XAI exchange rate.
 * Uses react-query for data fetching and caching.
 * @returns An object containing the exchange rate data and query status.
 */
export function useGetExchangeRate(currency: Currency) {
  return useQuery<ExchangeRate, Error>({
    queryKey: ["get-exchange-rate", currency], // Include currency in the queryKey
    queryFn: async () => {
      try {
        if (currency === 'XAI' || currency === 'ESXAI') {
          return await getEthXaiExchangeRate();
        }
        if (currency === 'USDC') {
          return await getEthUsdcExchangeRate();
        }
        return { exchangeRate: 0n };
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        throw new Error('Failed to fetch exchange rate');
      }
    },
    cacheTime: 0
  });
}
