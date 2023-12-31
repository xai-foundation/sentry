import {useQuery} from "react-query";
import {getWalletBalance as getWalletBalanceCore} from "@sentry/core";
import {ethers} from "ethers";

export function useBalance(address: string | undefined) {
	return useQuery({
		queryKey: ["balance", address],
		queryFn: async () => {
			const wei = await getWalletBalanceCore(address!);

			return {
				wei,
				ethString: ethers.formatEther(wei),
			}
		},
		staleTime: Infinity,
		cacheTime: 2500,
		enabled: address != undefined && address.length > 0,
	});
}
