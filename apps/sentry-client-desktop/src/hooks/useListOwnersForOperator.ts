import {useQuery} from "react-query";
import {listOwnersForOperator} from "@sentry/core";

export function useListOwnersForOperator(sentryAddress: string | undefined) {
	return useQuery({
		queryKey: ["ownersForOperator", sentryAddress],
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 2500));
			const owners = await listOwnersForOperator(sentryAddress!);
			return {owners};
		},
		staleTime: Infinity,
		cacheTime: Infinity,
		enabled: !!sentryAddress,
	});
}
