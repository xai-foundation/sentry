import {useQuery} from "react-query";
import {listOwnersForOperator} from "@sentry/core";

export function useListOwnersForOperator(sentryAddress: string | undefined) {
	return useQuery({
		queryKey: ["ownersForOperator", sentryAddress],
		queryFn: async () => {
			const owners = await listOwnersForOperator(sentryAddress!);
			return {owners};
		},
		staleTime: Infinity,
		cacheTime: Infinity,
		enabled: !!sentryAddress,
	});
}
