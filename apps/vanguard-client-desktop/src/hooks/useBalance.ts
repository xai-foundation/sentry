import {useQuery} from "react-query";
import {getWalletBalance as getWalletBalanceCore} from "@xai-vanguard-node/core";

export function useBalance(address: string) {
	return useQuery({
		queryKey: ["balance", address],
		queryFn: () => getWalletBalanceCore(address),
		cacheTime: 0,
	});
}
