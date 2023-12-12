import { useQuery } from "react-query";
import { getBalances } from "@sentry/core";

export function useGetSingleWalletBalance(address: string | null) {
	return useQuery({
		queryKey: ["get-single-balance", address],
		queryFn: async () => {
			if (!address) {
				// Handle the case where the address is not provided (or is null)
				return null;
			}

			const result = await getBalances([address], (address, xaiBalance, esXaiBalance) => {
				return {
					address,
					xaiBalance,
					esXaiBalance,
				};
			});

			return result ? result[0] : null; // Return the first result (single wallet) or null if no result
		},
		staleTime: Infinity,
		cacheTime: Infinity,
	});
}
