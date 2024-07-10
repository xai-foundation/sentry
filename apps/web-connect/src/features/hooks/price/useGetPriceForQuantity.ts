import { useQuery } from "react-query";
import { CheckoutTierSummary, getPriceForQuantity as getPriceForQuantityCore } from "@sentry/core";

interface PriceForQuantity {
    price: bigint;
    nodesAtEachPrice: CheckoutTierSummary[];
}

/**
 * Custom hook to fetch the price for a given quantity.
 * Uses react-query for data fetching and caching.
 * @param quantity - The quantity for which to fetch the price.
 * @returns An object containing the price data and query status.
 */
export function useGetPriceForQuantity(quantity: number) {
  return useQuery<PriceForQuantity, Error>({
    queryKey: ["price-for-quantity", quantity],
    queryFn: async () => {
      try {
        const data:PriceForQuantity = await getPriceForQuantityCore(Number(quantity));
        
        return data;
      } catch (error) {
        console.error('Failed to fetch price for quantity:', error);
        throw new Error('Failed to fetch price for quantity');
      }
    },
    cacheTime: 0
  });
}
