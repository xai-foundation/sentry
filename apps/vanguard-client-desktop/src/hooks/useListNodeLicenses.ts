import {useQuery} from "react-query";
import {listNodeLicenses} from "@xai-vanguard-node/core";

export function useListNodeLicenses(walletAddresses: string[] = []) {
	return useQuery({
		queryKey: ["licensesForWallets", walletAddresses],
		queryFn: async () => {
			console.log("inner loading:", walletAddresses);
			const mapping = {};

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
		cacheTime: 0,
		enabled: walletAddresses.length > 0,
	});
}
