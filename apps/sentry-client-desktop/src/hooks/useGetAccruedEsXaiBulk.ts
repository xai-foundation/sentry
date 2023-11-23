import {useEffect, useState} from "react";
import {getAccruedEsXaiBulk, GetAccruedEsXaiResponse} from "@sentry/core";
import {atom, useAtom} from "jotai";
import {useChainDataWithCallback} from "@/hooks/useChainDataWithCallback";

export type AccruedBalanceMap = Record<string, GetAccruedEsXaiResponse>;
export const accruedEsXaiAtom = atom<AccruedBalanceMap>({});

export function useGetAccruedEsXaiBulk() {
	const {licensesList} = useChainDataWithCallback();
	const [loading, setLoading] = useState(false);
	const [balances, setBalances] = useAtom(accruedEsXaiAtom);

	useEffect(() => {
		if (licensesList.length > 0) {
			void getBalances();
		}
	}, [JSON.stringify(licensesList.map(k => k.toString()))]);

	async function getBalances() {
		setLoading(true);
		await getAccruedEsXaiBulk(licensesList.map((item) => item.key), async (response) => setBalances(response));
		setLoading(false);
	}

	return {
		isLoading: loading,
		balances,
	}
}
