import { useOperator } from "@/features/operator";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { StatusMap } from "@/hooks/useKycStatusesWithCallback";
import { LicenseList, LicenseMap } from "@/hooks/useListNodeLicensesWithCallback";
import { useGetOperatorAddresses } from "./useGetOperatorAddresses";
import { BulkOwnerOrPool, config, MAINNET_ID, setConfigByChainId, TESTNET_ID } from "@sentry/core";
import { useGetUnclaimedChallengeData } from "./useGetUnclaimedChallengeData";

interface ChainState {
	anyLoading: boolean;
	ownersLoading: boolean;
	owners: string[];
	pools: string[];
	ownersKycLoading: boolean;
	ownersKycMap: StatusMap;
	combinedWalletsKycMap: StatusMap;
	licensesLoading: boolean;
	licensesMap: LicenseMap;
	combinedLicensesMap: LicenseMap;
	licensesList: LicenseList;
	combinedLicensesList: LicenseList;
	operatorWalletData: BulkOwnerOrPool[];
	totalKeys: number;
	totalAssignedKeys: number;
	network: string;
	unclaimedEsXaiFromSoloSubmission: number;
	estimateGasForUnclaimed: number;
}

const defaultChainState: ChainState = {
	anyLoading: true,
	ownersLoading: true,
	owners: [],
	pools: [],
	ownersKycLoading: false,
	ownersKycMap: {},
	combinedWalletsKycMap: {},
	licensesLoading: false,
	licensesMap: {},
	combinedLicensesMap: {},
	licensesList: [],
	combinedLicensesList: [],
	operatorWalletData: [],
	totalKeys: 0,
	totalAssignedKeys: 0,
	network: "arbitrum",
	unclaimedEsXaiFromSoloSubmission: 0,
	estimateGasForUnclaimed: 0
}

export const chainStateAtom = atom<ChainState>(defaultChainState);
export const chainStateRefreshAtom = atom(0);


/**
 * This hook is implemented in the ChainDataManager component, which is rendered at the top level of the app.
 * To enable our caching and prevent rate-limiting, do not implement this anywhere else but simply
 * read from chainStateAtom.
 */
export function useChainDataWithCallback() {
	const [chainState, setChainState] = useAtom(chainStateAtom);
	const chainStateRefresh = useAtomValue(chainStateRefreshAtom);
	const setChainStateRefresh = useSetAtom(chainStateRefreshAtom);

	const { publicKey } = useOperator();
	const {
		owners,
		pools,
		isLoadingOperatorAddresses: ownersLoading,
		operatorWalletData,
		totalKeys,
		totalAssignedKeys
	} = useGetOperatorAddresses(publicKey, chainStateRefresh);

	const { unclaimedEsXai, estimateGas, isLoadingUnclaimed } = useGetUnclaimedChallengeData(publicKey, chainStateRefresh);

	useEffect(() => {

		const handleConfigUpdate = (_event, message) => {
			if (message === "arbitrumSepolia") {
				setConfigByChainId(TESTNET_ID);
			} else {
				setConfigByChainId(MAINNET_ID);
			}

			setChainStateRefresh((_value) => {
				return _value + 1
			});
		};

		// Add the event listener
		window.ipcRenderer.on('config-updated', handleConfigUpdate);

		// Cleanup function to remove the listener
		return () => {
			window.ipcRenderer.removeListener('config-updated', handleConfigUpdate);
		};

	}, []);



	// set default state
	useEffect(() => {
		setChainState(defaultChainState);
	}, [chainStateRefresh]);

	// check if anything is loading
	useEffect(() => {
		setChainState((_chainState) => {
			return {
				..._chainState,
				ownersLoading,
				anyLoading: ownersLoading,
				pools,
				owners,
				operatorWalletData,
				totalKeys,
				totalAssignedKeys,
				network: config.defaultNetworkName,
				unclaimedEsXaiFromSoloSubmission: unclaimedEsXai,
				estimateGasForUnclaimed: estimateGas
			}
		});
	}, [ownersLoading, isLoadingUnclaimed]);

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
