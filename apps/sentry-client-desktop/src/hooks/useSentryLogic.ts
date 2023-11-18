import {useEffect, useState} from "react";
import {useAtom} from "jotai";
import {recommendedFundingBalance} from "@/features/home/SentryWallet";
import {useBalance} from "@/hooks/useBalance";
import {licensesAtom} from "@/hooks/useListNodeLicensesWithCallback";
import {useOperator} from "@/features/operator";

export function useSentryLogic() {
	const [licenses] = useAtom(licensesAtom);
	const {publicKey: operatorAddress} = useOperator();
	const {data: balance} = useBalance(operatorAddress);
	const [hasAssignedKeys, setHasAssignedKeys] = useState(Object.keys(licenses).length > 0);
	const [funded, setFunded] = useState<boolean | undefined>(
		balance && balance.wei !== undefined && balance.wei >= recommendedFundingBalance
	);

	useEffect(() => {
		setHasAssignedKeys(Object.keys(licenses).length > 0);
		setFunded(balance && balance.wei !== undefined && balance.wei >= recommendedFundingBalance);
	}, [licenses, balance]);

	return {
		hasAssignedKeys,
		funded,
	};
}
