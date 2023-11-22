import {useOperator} from "@/features/operator";
import {useListOwnersForOperatorWithCallback} from "@/hooks/useListOwnersForOperatorWithCallback";
import {atom, useAtom} from "jotai";
import {useEffect} from "react";
import {StatusMap, useKycStatusesWithCallback} from "@/hooks/useKycStatusesWithCallback";
import {
	getLicensesList,
	LicenseList,
	LicenseMap,
	useListNodeLicensesWithCallback
} from "@/hooks/useListNodeLicensesWithCallback";

interface ChainState {
	anyLoading: boolean;
	ownersLoading: boolean;
	owners: string[];
	ownersKycLoading: boolean;
	ownersKycMap: StatusMap;
	licensesLoading: boolean;
	licensesMap: LicenseMap;
	licensesList: LicenseList;
}

const defaultChainState: ChainState = {
	anyLoading: true,
	ownersLoading: true,
	owners: [],
	ownersKycLoading: false,
	ownersKycMap: {},
	licensesLoading: false,
	licensesMap: {},
	licensesList: [],
}

export const chainStateAtom = atom<ChainState>(defaultChainState);

export function useChainDataWithCallback() {
	const [chainState, setChainState] = useAtom(chainStateAtom);

	const {publicKey} = useOperator();
	const {isLoading: ownersLoading, owners} = useListOwnersForOperatorWithCallback(publicKey);
	//todo combine owners with manual-adds
	const {isLoading: ownersKycLoading, statusMap: ownersKycMap} = useKycStatusesWithCallback(owners);
	const {isLoading: licensesLoading, licensesMap} = useListNodeLicensesWithCallback(owners);

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

	// useEffect(() => {
	// 	setChainState((_chainState) => {
	// 		return {
	// 			..._chainState,
	// 			ownersKycLoading,
	// 		}
	// 	});
	// }, [ownersKycLoading]);

	// useEffect(() => {
	// 	setChainState((_chainState) => {
	// 		return {
	// 			..._chainState,
	// 			licensesLoading,
	// 		}
	// 	});
	// }, [licensesLoading]);

	useEffect(() => {
		setChainState((_chainState) => {
			return {
				..._chainState,
				owners,
			}
		});
	}, [owners]);

	useEffect(() => {
		setChainState((_chainState) => {
			return {
				..._chainState,
				ownersKycMap,
			}
		});
	}, [ownersKycMap]);

	useEffect(() => {
		setChainState((_chainState) => {
			return {
				..._chainState,
				licensesMap,
				licensesList: getLicensesList(licensesMap),
			}
		});
	}, [licensesMap]);

	return {
		chainState,
	}
}
