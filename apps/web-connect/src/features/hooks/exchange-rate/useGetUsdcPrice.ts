import { getPriceForQuantityUsdc } from "@/utils/getPriceForQuantityUsdc";
import { useQuery } from "react-query";


/**
 * Custom hook to fetch the USDC price of a Node License.
 * Uses react-query for data fetching and caching.
 * @returns An object containing the exchange rate data and query status.
 */
export function useGetUsdcPrice(quantity: number, promoCode: string) {
  return useQuery<{totalPrice: bigint}, Error>({
    queryKey: ["usdc-node-license-price"],
    queryFn: async () => {
      try {
        const data = await getPriceForQuantityUsdc(quantity, promoCode);
        return data;
      } catch (error) {
        console.error('Failed to fetch Usdc Price:', error);
        throw new Error('Failed to fetch Usdc Price');
      }
    },
    cacheTime: 0
  });
}
