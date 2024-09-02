import {useEffect, useState} from "react";
import {getAccruedEsXaiBulk, GetAccruedEsXaiResponse} from "@sentry/core";
import {atom, useAtom, useAtomValue} from "jotai";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";

export type AccruedBalanceMap = Record<string, GetAccruedEsXaiResponse>;
export const accruedEsXaiAtom = atom<AccruedBalanceMap>({});

export function useGetAccruedEsXaiBulk() {
	const {combinedLicensesList} = useAtomValue(chainStateAtom);
	const [loading, setLoading] = useState(false);
	const [balances, setBalances] = useAtom(accruedEsXaiAtom);

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (combinedLicensesList.length > 0) {
				void getBalances();
			}
		}, 3000);

		return () => clearTimeout(timeout);
	}, [combinedLicensesList]);

	//TODO this needs to be reworked, this sends to many RPC requests and get called multiple times throughout rerendering the app!
	async function getBalances() {
		setLoading(true);
		setBalances({});
		await getAccruedEsXaiBulk(combinedLicensesList.map((item) => item.key), async (response) => {
			setBalances({...response});
		});
		setLoading(false);
	}

	return {
		isLoading: loading,
		balances,
	}
}
