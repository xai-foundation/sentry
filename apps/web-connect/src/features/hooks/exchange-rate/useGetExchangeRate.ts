import { useQuery } from "react-query";
import { getEthXaiExchangeRate, getEthUsdExchangeRate } from "@sentry/core";

// Define TypeScript type for better type safety
interface ExchangeRate {
  exchangeRate: bigint; 
}

/**
 * Custom hook to fetch the ETH to XAI exchange rate.
 * Uses react-query for data fetching and caching.
 * @returns An object containing the exchange rate data and query status.
 */
export function useGetExchangeRate(currencyOut: string) {

  switch (currencyOut) {
    case "XAI":
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

    case "USD":
      return useQuery<ExchangeRate, Error>({
        queryKey: ["eth-usd-exchange-rate"],
        queryFn: async () => {
          try {
            const data = await getEthUsdExchangeRate();
            return { exchangeRate: data.exchangeRate };
          } catch (error) {
            console.error('Failed to fetch exchange rate:', error);
            throw new Error('Failed to fetch exchange rate');
          }
        },
        cacheTime: 0
      });
    
    default:
      console.error('Unsupported currencyOut');
      throw new Error('Unsupported currencyOut');
  }
}
