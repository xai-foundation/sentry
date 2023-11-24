import {useOperator} from "@/features/operator";
import {useListOwnersForOperatorWithCallback} from "@/hooks/useListOwnersForOperatorWithCallback";
import {atom, useAtom, useAtomValue, useSetAtom} from "jotai";
import {useEffect} from "react";
import {StatusMap, useKycStatusesWithCallback} from "@/hooks/useKycStatusesWithCallback";
import {getLicensesList, LicenseList, LicenseMap, useListNodeLicensesWithCallback} from "@/hooks/useListNodeLicensesWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";

interface ChainState {
	anyLoading: boolean;
	ownersLoading: boolean;
	owners: string[];
	ownersKycLoading: boolean;
	ownersKycMap: StatusMap;
	combinedWalletsKycMap: StatusMap;
	licensesLoading: boolean;
	licensesMap: LicenseMap;
	combinedLicensesMap: LicenseMap;
	licensesList: LicenseList;
	combinedLicensesList: LicenseList;
}

const defaultChainState: ChainState = {
	anyLoading: true,
	ownersLoading: true,
	owners: [],
	ownersKycLoading: false,
	ownersKycMap: {},
	combinedWalletsKycMap: {},
	licensesLoading: false,
	licensesMap: {},
	combinedLicensesMap: {},
	licensesList: [],
	combinedLicensesList: [],
}

export const chainStateAtom = atom<ChainState>(defaultChainState);
export const chainStateRefreshAtom = atom(0);

// todo implement refreshing

/**
 * This hook is implemented in the ChainDataManager component, which is rendered at the top level of the app.
 * To enable our caching and prevent rate-limiting, do not implement this anywhere else but simply
 * read from chainStateAtom.
 */
export function useChainDataWithCallback() {
	const [chainState, setChainState] = useAtom(chainStateAtom);
	const chainStateRefresh = useAtomValue(chainStateRefreshAtom);
	const {publicKey} = useOperator();
	const {isLoading: ownersLoading, owners} = useListOwnersForOperatorWithCallback(publicKey, false, chainStateRefresh);
	const {combinedOwners} = useCombinedOwners(owners);
	const {isLoading: ownersKycLoading, statusMap: combinedWalletsKycMap} = useKycStatusesWithCallback(combinedOwners, chainStateRefresh);
	const {isLoading: licensesLoading, licensesMap: combinedLicensesMap} = useListNodeLicensesWithCallback(combinedOwners, chainStateRefresh);

	useEffect(() => {
		setChainState(defaultChainState);
	}, [chainStateRefresh]);

	useEffect(() => {
		setChainState((_chainState) => {
			return {
				..._chainState,
				ownersLoading,
				ownersKycLoading,
				licensesLoading,
				anyLoading: ownersLoading || ownersKycLoading || licensesLoading,
			}
		});
	}, [ownersLoading, ownersKycLoading, licensesLoading]);

	useEffect(() => {
		setChainState((_chainState) => {
			return {
				..._chainState,
				owners,
			}
		});
	}, [JSON.stringify(owners)]);

	useEffect(() => {
		setChainState((_chainState) => {
			const ownersKycMap = Object.keys(combinedWalletsKycMap).reduce((result, wallet) => {
				if (owners.includes(wallet)) {
					result[wallet] = combinedWalletsKycMap[wallet];
				}
				return result;
			}, {});

			return {
				..._chainState,
				ownersKycMap,
				combinedWalletsKycMap,
			}
		});
	}, [JSON.stringify(combinedWalletsKycMap)]);

	useEffect(() => {
		setChainState((_chainState) => {
			const licensesMap = Object.keys(combinedLicensesMap).reduce((result, wallet) => {
				if (owners.includes(wallet)) {
					result[wallet] = combinedLicensesMap[wallet];
				}
				return result;
			}, {});

			return {
				..._chainState,
				licensesMap,
				combinedLicensesMap,
				licensesList: getLicensesList(licensesMap),
				combinedLicensesList: getLicensesList(combinedLicensesMap)
			}
		});
	}, [JSON.stringify(Object.values(combinedLicensesMap).map(toString))]);

	return {
		...chainState,
	}
}

export function useChainDataRefresh() {
	const setChainStateRefresh = useSetAtom(chainStateRefreshAtom);

	function refresh() {
		setChainStateRefresh((_value) => {
			return _value + 1
		});
	}

	return {
		refresh
	};
}
