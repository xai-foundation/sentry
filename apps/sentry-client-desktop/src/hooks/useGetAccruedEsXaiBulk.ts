import {useEffect, useState} from "react";
import {getAccruedEsXaiBulk} from "@sentry/core";

// export type AccruedBalanceMap = Record<string, GetAccruedEsXaiResponse>;

export function useGetAccruedEsXaiBulk(keys: bigint[] = []) {

	const [loading, setLoading] = useState(false);
	const [balances, setBalances] = useState<bigint[]>([]);

	useEffect(() => {
		if (keys.length > 0) {
			void getBalances();
		}
	}, [JSON.stringify(keys.map(k => k.toString()))]);

	async function getBalances() {
		setLoading(true);

		await getAccruedEsXaiBulk(keys, async (response) => {
			setBalances((_balances) => {
				return {
					..._balances,
					[keys.toString()]: response,
				}
			});
		});

		setLoading(false);
	}

	return {
		isLoading: loading,
		balances,
	}
}
