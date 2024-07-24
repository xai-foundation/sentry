import { useQuery } from "react-query";
import { listClaimableAmount } from "@sentry/core";

/**
 * Custom hook to fetch the claimable amount for a given address.
 * Uses react-query for data fetching and caching.
 * @param address - The address for which to fetch the claimable amount.
 * @returns An object containing the claimable amount data and query status.
 */
export function useListClaimableAmount(address: string | undefined) {
  return useQuery<bigint, Error>({
    queryKey: ["list-claimable-amount", address],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is undefined');
      }

      try {
        const amount = await listClaimableAmount(address);
        return amount;
      } catch (error) {
        console.error('Failed to fetch claimable amount:', error);
        throw new Error('Failed to fetch claimable amount');
      }
    },
    staleTime: Infinity, // Data will never be considered stale // TODO confirm this is correct?
    cacheTime: 0, // No caching
    enabled: Boolean(address), // Only enable query if address is provided
  });
}
