import {useQuery} from "react-query";
import {getProvider} from "@sentry/core";

export function useProvider() {
	return useQuery({
		queryKey: ["provider"],
		queryFn: async () => {
			const provider = getProvider();
			const network = await provider.getNetwork();

			return {
				network,
				blockExplorer: blockExplorerUrls[Number(network.chainId)],
			}
		},
		cacheTime: 0,
	});
}

const blockExplorerUrls: Record<number, string> = {
	42161: "https://arbiscan.io",
	421613: "https://goerli.arbiscan.io",
	47279324479: "https://testnet-explorer.xai-chain.net",
	421614: "https://sepolia.arbiscan.io",
}
