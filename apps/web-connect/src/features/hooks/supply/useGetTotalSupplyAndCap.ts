import { useQuery } from "react-query";
import { getTotalSupplyAndCap } from "@sentry/core";

interface TotalSupplyAndCap {
  totalSupply: bigint;
  cap: bigint;
}

/**
 * Custom hook to fetch the total supply and cap.
 * Uses react-query for data fetching and caching.
 * @returns An object containing the total supply and cap data and query status.
 */
export function useGetTotalSupplyAndCap() {
  return useQuery<TotalSupplyAndCap, Error>({
    queryKey: ["total-supply-and-cap"],
    queryFn: async () => {
      try {
        const data = await getTotalSupplyAndCap();
        return {
          totalSupply: data.totalSupply,
          cap: data.maxSupply
        };
      } catch (error) {
        console.error('Failed to fetch total supply and cap:', error);
        throw new Error('Failed to fetch total supply and cap');
      }
    },
    cacheTime: 0 // No caching
  });
}
