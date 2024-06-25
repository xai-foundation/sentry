import {useQuery} from "react-query";
import {getEthXaiExchangeRate} from "@sentry/core";

export function useGetExchangeRate() {
	return useQuery({
		queryKey: ["eth-xai-exchange-rate"],
		queryFn: () => getEthXaiExchangeRate(),
		cacheTime: 0,
	})
}
