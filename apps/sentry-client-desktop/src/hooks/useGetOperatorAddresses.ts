import { useEffect, useState } from "react";
import { BulkOwnerOrPool, getSentryWalletsForOperator, loadOperatorWalletsFromGraph } from "@sentry/core";

export type StatusMap = Record<string, boolean>;

export function useGetOperatorAddresses(operatorPublicKey: string | undefined, refresh = 0) {
	const [isLoadingOperatorAddresses, setIsLoading] = useState(false);
	const [operatorWalletData, setOperatorWalletData] = useState<BulkOwnerOrPool[]>([]);
	const [owners, setOwners] = useState<string[]>([]);
	const [pools, setPools] = useState<string[]>([]);

	useEffect(() => {
		setOperatorWalletData([]);
	}, [refresh]);

	useEffect(() => {
		if (operatorPublicKey) {
			void loadOperatorWallets(operatorPublicKey);
		}
	}, [operatorPublicKey, refresh]);

	async function loadOperatorWallets(operator: string) {
		setIsLoading(true);

		const { wallets, pools } = await getSentryWalletsForOperator(operator, {});
		const ownerWalletsAndPools = await loadOperatorWalletsFromGraph(operator, { wallets, pools });

		setOwners(wallets.map(w => w.address));
		setPools(pools.map(p => p.address));
		setOperatorWalletData(ownerWalletsAndPools);

		setIsLoading(false);
	}

	return {
		isLoadingOperatorAddresses,
		operatorWalletData,
		owners,
		pools
	}
}