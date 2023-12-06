import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {useOperator} from "@/features/operator";
import {useBalance} from "@/hooks/useBalance";
import {recommendedFundingBalance} from "@/features/home/SentryWallet";
import {AccruedBalanceMap, useGetAccruedEsXaiBulk} from "@/hooks/useGetAccruedEsXaiBulk";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {atom, useAtom, useAtomValue} from "jotai";
import {useEffect, useState} from "react";

interface AccruingState {
	funded: boolean | undefined;
	accruing: boolean | undefined;
	balances: AccruedBalanceMap;
	isBalancesLoading: boolean;
	balancesFetchedLast: null | Date
	hasAssignedKeys: boolean;
	kycRequired: boolean;
}

const defaultAccruingState: AccruingState = {
	funded: false,
	accruing: false,
	balances: {},
	isBalancesLoading: false,
	balancesFetchedLast: null,
	hasAssignedKeys: false,
	kycRequired: true,
}

export const accruingStateAtom = atom<AccruingState>(defaultAccruingState);
export const accruingStateRefreshAtom = atom(0);

export function useAccruingInfo() {
	const [accruingState, setAccruingState] = useAtom(accruingStateAtom);
	const {sentryRunning} = useOperatorRuntime();
	const {publicKey: operatorAddress} = useOperator();
	const {data: balance} = useBalance(operatorAddress);

	const {owners, licensesMap, ownersKycMap} = useAtomValue(chainStateAtom);
	const {balances, isLoading: isBalancesLoading} = useGetAccruedEsXaiBulk();
	const kycRequired = owners?.length > 0 && ownersKycMap && Object.values(ownersKycMap).filter((status) => !status).length > 0;

	const funded = balance && balance.wei !== undefined && balance.wei >= recommendedFundingBalance;
	const accruing = sentryRunning && funded && Object.keys(licensesMap).length > 0;
	const [balancesFetchedLast, setBalancesFetchedLast] = useState<null | Date>(null);

	// set default state
	useEffect(() => {
		setAccruingState(defaultAccruingState);
	}, [accruingStateRefreshAtom]);

	// check if anything is loading
	useEffect(() => {
		setAccruingState((_accruingState) => {
			return {
				..._accruingState,
				isBalancesLoading,
			}
		});
	}, [isBalancesLoading]);

	// return balances
	useEffect(() => {
		setAccruingState((_accruingState) => {
			return {
				..._accruingState,
				balances,
			}
		});
	}, [balances]);

	useEffect(() => {
		setAccruingState((_accruingState) => {
			if (isBalancesLoading) {
				setBalancesFetchedLast(new Date());
			}
			return {
				..._accruingState,
				balancesFetchedLast,
			}
		});
	}, [isBalancesLoading]);

	// return funded
	useEffect(() => {
		setAccruingState((_accruingState) => {
			return {
				..._accruingState,
				funded,
			}
		});
	}, [funded]);

	// return accruing
	useEffect(() => {
		setAccruingState((_accruingState) => {
			return {
				..._accruingState,
				accruing,
			}
		});
	}, [accruing]);

	// return kycRequired
	useEffect(() => {
		setAccruingState((_accruingState) => {
			return {
				..._accruingState,
				kycRequired,
			}
		});
	}, [kycRequired]);

	// return hasAssignedKeys
	useEffect(() => {
		setAccruingState((_accruingState) => {
			return {
				..._accruingState,
				hasAssignedKeys: Object.keys(licensesMap).length > 0,
			}
		});
	}, [licensesMap]);

	return {
		...accruingState,
	}
}
