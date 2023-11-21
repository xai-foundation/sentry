import {useEffect, useState} from "react";
import {getAccruedEsXaiBulk, GetAccruedEsXaiResponse} from "@sentry/core";

export type AccruedBalanceMap = Record<bigint, GetAccruedEsXaiResponse>;

export function useGetAccruedEsXaiBulk(keys: bigint[] = []) {

	const [loading, setLoading] = useState(false);
	const [balances, setBalances] = useState<AccruedBalanceMap>({});

	useEffect(() => {
		if (keys.length > 0) {
			void getBalances();
		}
	}, [JSON.stringify(keys.map(k => k.toString()))]);

	async function getBalances() {
		setLoading(true);

		console.log("about to call;", keys)
		const res = await getAccruedEsXaiBulk(keys, async (response, nodeLicenseId) => {
			console.log("cb");
			let updatedBalance = balances[nodeLicenseId] || {};
			updatedBalance = response;

			setBalances((_balances) => {
				return {
					..._balances,
					[nodeLicenseId]: updatedBalance,
				}
			});
		});
		console.log("res:", res);

		setLoading(false);
	}

	return {
		isLoading: loading,
		balances,
	}
}
