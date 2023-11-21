import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {useOperator} from "@/features/operator";
import {useBalance} from "@/hooks/useBalance";
import {useListOwnersForOperatorWithCallback} from "@/hooks/useListOwnersForOperatorWithCallback";
import {useListNodeLicensesWithCallback} from "@/hooks/useListNodeLicensesWithCallback";
import {recommendedFundingBalance} from "@/features/home/SentryWallet";
import {useKycStatusesWithCallback} from "@/hooks/useKycStatusesWithCallback";
import {useGetAccruedEsXaiBulk} from "@/hooks/useGetAccruedEsXaiBulk";
import {GetAccruedEsXaiResponse} from "@sentry/core";

export function useAccruingInfo() {
	const {sentryRunning} = useOperatorRuntime();
	const {publicKey: operatorAddress} = useOperator();

	const {data: balance} = useBalance(operatorAddress);
	const {owners} = useListOwnersForOperatorWithCallback(operatorAddress, true);
	const {licensesMap} = useListNodeLicensesWithCallback(owners);

	const {statusMap} = useKycStatusesWithCallback(owners);
	const {balances} = useGetAccruedEsXaiBulk(Object.values(licensesMap));
	console.log("balances;", balances);
	const kycRequired = owners?.length > 0 && statusMap && Object.values(statusMap).filter((status) => !status).length > 0 && Object.values(balances).filter((res: GetAccruedEsXaiResponse) => res.totalAccruedEsXai > BigInt(0));

	const funded = balance && balance.wei !== undefined && balance.wei >= recommendedFundingBalance;
	const accruing = sentryRunning && funded && Object.keys(licensesMap).length > 0;

	return {
		accruing,
		owners,
		statusMap,
		kycRequired,
	}
}
