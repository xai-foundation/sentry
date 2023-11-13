import {useQuery} from "react-query";
import {getTotalSupplyAndCap} from "@sentry/core";

export function useGetTotalSupplyAndCap() {
	return useQuery({
		queryKey: ["total-supply-and-cap"],
		queryFn: () => getTotalSupplyAndCap(),
		cacheTime: 0,
	})
}
