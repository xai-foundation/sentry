import {useQuery} from "react-query";
import {getErc20Allowance} from "@sentry/core";

export function useGetErc20Allowance(wallet: string, token: string, operator: string) {
	return useQuery({
		queryKey: ["get-erc20-allowance", wallet, token, operator,],
		queryFn: () => getErc20Allowance(wallet, token, operator),
		cacheTime: 0,
	})
}
