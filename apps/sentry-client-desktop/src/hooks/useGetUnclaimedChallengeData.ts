import { useEffect, useState } from "react";
import { useStorage } from "@/features/storage";
import { getUnclaimedChallengeData } from "@sentry/core";

export function useGetUnclaimedChallengeData(operatorPublicKey: string | undefined, refresh = 0) {
	const [isLoadingUnclaimed, setIsLoading] = useState(false);
	const [unclaimedEsXai, setUnclaimedEsXai] = useState<number>(0);
	const [estimateGas, setEstimateGas] = useState<number>(0);
	const { data } = useStorage()

	useEffect(() => {
		setUnclaimedEsXai(0);
		setEstimateGas(0);
	}, [refresh]);

	useEffect(() => {
		void loadUnclaimedData(operatorPublicKey);
	}, [operatorPublicKey, refresh, data?.whitelistedWallets]);

	async function loadUnclaimedData(operator?: string) {
		if (operator) {
			setIsLoading(true);
			const unclaimedData = await getUnclaimedChallengeData(operator, data?.whitelistedWallets);
			setUnclaimedEsXai(unclaimedData.unclaimedEsXai);
			setEstimateGas(unclaimedData.estimateGas);
			setIsLoading(false);
		}
	}

	return {
		isLoadingUnclaimed,
		unclaimedEsXai,
		estimateGas
	}
}