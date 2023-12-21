import {useQuery} from "react-query";
import {listClaimableAmount} from "@sentry/core";

export function useListClaimableAmount(address: string | undefined) {
	return useQuery({
		queryKey: ["list-claimable-amount", address],
		queryFn: async () => {
			const claimableAmount = await listClaimableAmount(address!);
			return {
				claimableAmount,
			}
		},
		staleTime: Infinity,
		cacheTime: 0,
		enabled: address != undefined && address.length > 0,
	});
}
