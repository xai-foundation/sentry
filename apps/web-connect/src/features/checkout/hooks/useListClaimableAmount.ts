import {useQuery} from "react-query";
import {listClaimableAmount} from "@sentry/core";

export function useListClaimableAmount(address: string | undefined) {
	return useQuery({
		queryKey: ["list-claimable-amount", address],
		queryFn: async () => {
			return await listClaimableAmount(address!);
		},
		staleTime: Infinity,
		cacheTime: 2500,
		enabled: address != undefined && address.length > 0,
	});
}
