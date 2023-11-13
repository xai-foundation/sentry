import {useQuery} from "react-query";
import {getPriceForQuantity as getPriceForQuantityCore} from "@sentry/core";

export function useGetPriceForQuantity(quantity: number) {
	return useQuery({
		queryKey: ["price-for-quantity", quantity],
		queryFn: () => getPriceForQuantityCore(Number(quantity)),
		cacheTime: 0,
	});
}
