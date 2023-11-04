import {useQuery} from "react-query";
import {listOwnersForOperator} from "@xai-vanguard-node/core";

export function useListOwnersForOperator(sentryAddress: string) {
	return useQuery({
		queryKey: ["ownersForOperator", sentryAddress],
		queryFn: async () => {
			console.log("querying listOwnersForOperator")
			const owners = await listOwnersForOperator(sentryAddress);
			return {owners};
		},
		cacheTime: 0,
		enabled: !!sentryAddress,
	});
}
