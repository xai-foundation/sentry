import {useQuery} from "react-query";
import {listNodeLicenses} from "@sentry/core";

export function useListNodeLicenses(walletAddresses: string[] = []) {
	return useQuery({
		queryKey: ["licensesForWallets", walletAddresses],
		queryFn: async () => {
			const mapping: Record<string, bigint[]> = {};

			await Promise.all(walletAddresses.map(async (walletAddress) => {
				mapping[walletAddress] = await listNodeLicenses(walletAddress);
			}));

			return {
				licenses: mapping,
				totalLicenses: Object.keys(mapping).reduce((acc: number, wallet: string) => {
					acc += mapping[wallet].length;
					return acc;
				}, 0),
			}
		},
		staleTime: Infinity,
		cacheTime: Infinity,
		enabled: walletAddresses.length > 0,
	});
}
