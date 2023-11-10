import {useQuery} from "react-query";
import {getWalletBalance as getWalletBalanceCore} from "@xai-vanguard-node/core";
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
		enabled: address != undefined && address.length > 0,
	});
}
