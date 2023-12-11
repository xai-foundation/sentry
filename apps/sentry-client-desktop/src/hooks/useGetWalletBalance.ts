import {useQuery} from "react-query";
import {getBalances} from "@sentry/core";

export interface EarnedEsxaiBalance {
	address: string;
	xaiBalance: bigint;
	esXaiBalance: bigint;
}

export function useGetWalletBalance(addressesArray: string[]) {
	return useQuery({
		queryKey: ["get-balances", addressesArray],
		queryFn: async () => {
			return await getBalances(addressesArray, (address, xaiBalance, esXaiBalance) => {
				return {
					address,
					xaiBalance,
					esXaiBalance,
				};
			});
		},
		staleTime: Infinity,
		cacheTime: Infinity,
	});
}
