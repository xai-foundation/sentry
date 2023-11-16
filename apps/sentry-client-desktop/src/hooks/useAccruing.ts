import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {useOperator} from "@/features/operator";
import {useBalance} from "@/hooks/useBalance";
import {useListOwnersForOperatorWithCallback} from "@/hooks/useListOwnersForOperatorWithCallback";
import {useListNodeLicensesWithCallback} from "@/hooks/useListNodeLicensesWithCallback";
import {recommendedFundingBalance} from "@/features/home/SentryWallet";

export function useAccruing() {
	const {sentryRunning} = useOperatorRuntime();
	const {publicKey: operatorAddress} = useOperator();
	const {data: balance} = useBalance(operatorAddress);
	const {owners} = useListOwnersForOperatorWithCallback(operatorAddress, true);
	const {licensesMap} = useListNodeLicensesWithCallback(owners);

	const funded = balance && balance.wei !== undefined && balance.wei >= recommendedFundingBalance;
	console.log("sentryRunning:", sentryRunning);
	console.log("funded:", funded);
	console.log("Object.keys(licensesMap).length:", Object.keys(licensesMap).length);

	return sentryRunning && funded && Object.keys(licensesMap).length > 0;
}
