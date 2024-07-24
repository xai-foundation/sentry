import { useQuery } from "react-query";
import { getEthXaiExchangeRate } from "@sentry/core";

// Define TypeScript type for better type safety
interface ExchangeRate {
  exchangeRate: bigint; 
}

/**
 * Custom hook to fetch the ETH to XAI exchange rate.
 * Uses react-query for data fetching and caching.
 * @returns An object containing the exchange rate data and query status.
 */
export function useGetExchangeRate() {
  return useQuery<ExchangeRate, Error>({
    queryKey: ["eth-xai-exchange-rate"],
    queryFn: async () => {
      try {
        const data = await getEthXaiExchangeRate();
        return { exchangeRate: data.exchangeRate };
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        throw new Error('Failed to fetch exchange rate');
      }
    },
    cacheTime: 0
  });
}
