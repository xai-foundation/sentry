import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {useOperator} from "@/features/operator";
import {useBalance} from "@/hooks/useBalance";
import {recommendedFundingBalance} from "@/features/home/SentryWallet";
import {useGetAccruedEsXaiBulk} from "@/hooks/useGetAccruedEsXaiBulk";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useAtomValue} from "jotai";

export function useAccruingInfo() {
	const {sentryRunning} = useOperatorRuntime();
	const {publicKey: operatorAddress} = useOperator();
	const {data: balance} = useBalance(operatorAddress);

	const {owners, licensesMap, ownersKycMap} = useAtomValue(chainStateAtom);
	const {balances, isLoading: isBalancesLoading} = useGetAccruedEsXaiBulk();
	const kycRequired = owners?.length > 0 && ownersKycMap && Object.values(ownersKycMap).filter((status) => !status).length > 0;

	const funded = balance && balance.wei !== undefined && balance.wei >= recommendedFundingBalance;
	const accruing = sentryRunning && funded && Object.keys(licensesMap).length > 0;

	return {
		funded,
		accruing,
		balances,
		isBalancesLoading,
		hasAssignedKeys: Object.keys(licensesMap).length > 0,
		kycRequired,
		owners,
		ownersKycMap,
	}
}
