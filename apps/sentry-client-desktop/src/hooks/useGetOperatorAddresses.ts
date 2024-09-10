import { useEffect, useState } from "react";
import { BulkOwnerOrPool, getSentryWalletDataFromGraph, getSentryWalletsForOperator, getUserStakedPoolsFromGraph } from "@sentry/core";
import { useStorage } from "@/features/storage";
import { getAddress } from "ethers";

export function useGetOperatorAddresses(operatorPublicKey: string | undefined, refresh = 0) {
	const [isLoadingOperatorAddresses, setIsLoading] = useState(false);
	const [operatorWalletData, setOperatorWalletData] = useState<BulkOwnerOrPool[]>([]);
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
		const filteredPools: string[] = [];

		if (wallets.length > 0) {
			wallets.forEach(w => {
				const address = getAddress(w.address);
				const keyCount = Number(w.keyCount) - Number(w.stakedKeyCount);
				if (keyCount == 0) {
					return;
				}

				filteredOwners.push(address);
				mappedAddresses[address] = true;
				_totalKeys += keyCount;
				_totalAssignedKeys += keyCount;
				operatorWalletData.push({ ...w, address, keyCount, isPool: false, stakedEsXaiAmount: w.v1EsXaiStakeAmount })
			});
		}

		if (pools.length) {
			pools.forEach(p => {
				const address = getAddress(p.address);
				mappedAddresses[address] = true;
				filteredPools.push(address);
				_totalKeys += Number(p.totalStakedKeyAmount);
				_totalAssignedKeys += Number(p.totalStakedKeyAmount);
				operatorWalletData.push({ ...p, address, keyCount: Number(p.totalStakedKeyAmount), isPool: true, name: p.metadata[0], bulkSubmissions: p.submissions, stakedEsXaiAmount: p.totalStakedEsXaiAmount })
			});
		}

		//Load pools our operators have keys staked in
		const stakedPools = await getUserStakedPoolsFromGraph(filteredOwners, pools.map(p => p.address), false, {});

		stakedPools.forEach(p => {
			const address = getAddress(p.address);
			if (!mappedAddresses[address]) {
				mappedAddresses[address] = true;
				filteredPools.push(address);
				_totalKeys += Number(p.keyCount);
				_totalAssignedKeys += Number(p.keyCount);
				operatorWalletData.push({...p, address});
			}
		})

		if (data?.addedWallets) {

			const filteredAddresses = data.addedWallets.filter(a => mappedAddresses[getAddress(a)] !== true);
			if (filteredAddresses.length) {
				const addedWalletData = await getSentryWalletDataFromGraph(filteredAddresses.map(a => a.toLowerCase()));
				addedWalletData.forEach(w => {
					const address = getAddress(w.address);
					const keyCount = Number(w.keyCount) - Number(w.stakedKeyCount);
					if (keyCount == 0) {
						return;
					}
					mappedAddresses[address] = true;
					_totalKeys += Number(keyCount);
					operatorWalletData.push({ ...w, address, keyCount, isPool: false, stakedEsXaiAmount: w.v1EsXaiStakeAmount })
				});
			}
		}

		setOwners(filteredOwners);
		setPools(filteredPools);
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