import {useEffect, useState} from "react";
import {listOwnersForOperator} from "@sentry/core";
import {useQuery} from "react-query";

export function useListOwnersForOperatorWithCallback(operatorAddress: string | undefined, initialLoadingState = false) {

	const [loading, setLoading] = useState(initialLoadingState);
	const [owners, setOwners] = useState<string[]>([]);

	useEffect(() => {
		if (operatorAddress) {
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

export function useCachedListOwnersForOperatorWithCallback(operatorAddress: string | undefined) {
	// todo: continue here
	const {owners} = useListOwnersForOperatorWithCallback(operatorAddress, true);

	return useQuery({
		queryKey: ["use-cached-list-owners-for-operator-with-callback", operatorAddress],
		queryFn: async () => {
			return owners;
		},
		cacheTime: Infinity,
		enabled: operatorAddress != null,
	})
}
