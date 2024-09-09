import { useEffect, useState } from "react";
import { BulkOwnerOrPool, getSentryWalletData, getSentryWalletsForOperator } from "@sentry/core";
import { useStorage } from "@/features/storage";
import { getAddress } from "ethers";

export function useGetOperatorAddresses(operatorPublicKey: string | undefined, refresh = 0) {
	const [isLoadingOperatorAddresses, setIsLoading] = useState(false);
	const [operatorWalletData, setOperatorWalletData] = useState<Array<BulkOwnerOrPool & {}>>([]);
	const [owners, setOwners] = useState<string[]>([]);
	const [pools, setPools] = useState<string[]>([]);
	const [totalKeys, setTotalKeys] = useState<number>(0);
	const [totalAssignedKeys, setTotalAssignedKeys] = useState<number>(0);
	const { data } = useStorage()

	useEffect(() => {
		setOperatorWalletData([]);
	}, [refresh]);

	useEffect(() => {
		if (operatorPublicKey) {
			void loadOperatorWallets(operatorPublicKey);
		}
	}, [operatorPublicKey, refresh, data?.addedWallets]);

	async function loadOperatorWallets(operator: string) {
		setIsLoading(true);

		const operatorWalletData: BulkOwnerOrPool[] = [];

		const mappedAddresses: { [address: string]: boolean } = {}

		let _totalKeys = 0;
		let _totalAssignedKeys = 0;

		const { wallets, pools } = await getSentryWalletsForOperator(operator, {});

		const filteredOwners: string[] = [];

		if (wallets.length > 0) {
			wallets.forEach(w => {
				const address = getAddress(w.address);
				if (address === getAddress(operator) && Number(w.keyCount) == 0) {
					return;
				}

				filteredOwners.push(address);
				mappedAddresses[address] = true;
				_totalKeys += Number(w.keyCount);
				_totalAssignedKeys += Number(w.keyCount);
				operatorWalletData.push({ ...w, address, keyCount: Number(w.keyCount), isPool: false, stakedEsXaiAmount: w.v1EsXaiStakeAmount })
			});
		}

		if (pools.length) {
			pools.forEach(p => {
				const address = getAddress(p.address);
				mappedAddresses[address] = true;
				_totalKeys += Number(p.totalStakedKeyAmount);
				_totalAssignedKeys += Number(p.totalStakedKeyAmount);
				operatorWalletData.push({ ...p, address, keyCount: Number(p.totalStakedKeyAmount), isPool: true, name: p.metadata[0], bulkSubmissions: p.submissions, stakedEsXaiAmount: p.totalStakedEsXaiAmount })
			});
		}

		if (data?.addedWallets) {

			const filteredAddresses = data.addedWallets.filter(a => mappedAddresses[getAddress(a)] !== true);
			if (filteredAddresses.length) {
				const addedWalletData = await getSentryWalletData(filteredAddresses.map(a => a.toLowerCase()));
				addedWalletData.forEach(w => {
					const address = getAddress(w.address);
					mappedAddresses[address] = true;
					_totalKeys += Number(w.keyCount);
					operatorWalletData.push({ ...w, address, keyCount: Number(w.keyCount), isPool: false, stakedEsXaiAmount: w.v1EsXaiStakeAmount })
				});
			}
		}

		setOwners(filteredOwners);
		setPools(pools.map(p => getAddress(p.address)));
		setOperatorWalletData(operatorWalletData);
		setTotalKeys(_totalKeys);
		setTotalAssignedKeys(_totalAssignedKeys);
		setIsLoading(false);
	}

	return {
		isLoadingOperatorAddresses,
		operatorWalletData,
		owners,
		pools,
		totalKeys,
		totalAssignedKeys
	}
}