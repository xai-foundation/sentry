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
	kycRequired: false,
}

export const accruingStateAtom = atom<AccruingState>(defaultAccruingState);
export const accruingStateRefreshAtom = atom(0);

export function useAccruingInfo() {
	const [accruingState, setAccruingState] = useAtom(accruingStateAtom);
	const {sentryRunning} = useOperatorRuntime();
	const {publicKey: operatorAddress} = useOperator();
	const {data: balance} = useBalance(operatorAddress);

	const {totalAssignedKeys} = useAtomValue(chainStateAtom);
	const {balances, isLoading: isBalancesLoading} = useGetAccruedEsXaiBulk();
	// const kycRequired = owners?.length > 0 && ownersKycMap && Object.values(ownersKycMap).filter((status) => !status).length > 0;
	const kycRequired = false; //With the TK upgrade KYC is not needed to run the operator anymore.

	const funded = balance && balance.wei !== undefined && balance.wei >= recommendedFundingBalance;
	const accruing = sentryRunning && funded && totalAssignedKeys > 0;
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
				hasAssignedKeys: totalAssignedKeys > 0,
				funded
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
				hasAssignedKeys: totalAssignedKeys > 0,
				funded
			}
		});
	}, [isBalancesLoading]);

	// return funded
	useEffect(() => {
		setAccruingState((_accruingState) => {
			return {
				..._accruingState,
				hasAssignedKeys: totalAssignedKeys > 0,
				funded
			}
		});
	}, [balance]);

	// return accruing
	useEffect(() => {
		setAccruingState((_accruingState) => {
			return {
				..._accruingState,
				accruing,
				hasAssignedKeys: totalAssignedKeys > 0,
				funded
			}
		});
	}, [accruing]);

	// return kycRequired
	useEffect(() => {
		setAccruingState((_accruingState) => {
			return {
				..._accruingState,
				kycRequired,
				hasAssignedKeys: totalAssignedKeys > 0,
				funded
			}
		});
	}, [kycRequired]);

	// return hasAssignedKeys
	useEffect(() => {
		setAccruingState((_accruingState) => {
			return {
				..._accruingState,
				hasAssignedKeys: totalAssignedKeys > 0,
				funded
			}
		});
	}, [totalAssignedKeys]);

	return {
		...accruingState,
	}
}
