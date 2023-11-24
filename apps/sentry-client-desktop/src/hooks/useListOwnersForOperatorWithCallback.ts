import {useEffect, useState} from "react";
import {listOwnersForOperator} from "@sentry/core";

export function useListOwnersForOperatorWithCallback(operatorAddress: string | undefined, initialLoadingState = false) {

	const [loading, setLoading] = useState(initialLoadingState);
	const [owners, setOwners] = useState<string[]>([]);

	useEffect(() => {
		// console.log(0);
		if (operatorAddress) {
			// console.log(1);
			void getOperators(operatorAddress);
		}
	}, [operatorAddress]);

	async function getOperators(_operatorAddress: string) {
		setLoading(true);

		await listOwnersForOperator(_operatorAddress, foundOwnerCallback);

		setLoading(false);
	}

	function foundOwnerCallback(owner: string) {
		setOwners((_owners) => {
			const updatedOwners = [..._owners];

			if (updatedOwners.indexOf(owner) < 0) {
				updatedOwners.push(owner);
			}

			return updatedOwners;
		});
	}

	return {
		isLoading: loading,
		owners,
	}
}
