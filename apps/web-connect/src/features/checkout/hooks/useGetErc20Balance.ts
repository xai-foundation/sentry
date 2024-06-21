import {useQuery} from "react-query";
import {getErc20Balance} from "@sentry/core";

export function useGetErc20Balance(wallet: string, token: string) {
	return useQuery({
		queryKey: ["get-erc20-balance", ],
		queryFn: () => getErc20Balance(wallet, token),
		cacheTime: 0,
	})
}
