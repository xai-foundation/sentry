import {useQuery} from "react-query";
import {getTotalSupplyAndCap} from "@xai-vanguard-node/core";

export function useGetTotalSupplyAndCap() {
	return useQuery({
		queryKey: ["total-supply-and-cap"],
		queryFn: () => getTotalSupplyAndCap(),
		cacheTime: 0,
	})
}
