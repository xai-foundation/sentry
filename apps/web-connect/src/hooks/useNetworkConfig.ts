import {useEffect} from "react";
import { getAccount} from '@wagmi/core'
import { setConfigByChainId } from "@sentry/core"
import { wagmiAdapter } from "@/app/App";

interface NetworkConfig {
    chainId: number | undefined;
    address: `0x${string}` | undefined;
    isConnected: boolean;
    isDevelopment: boolean;
}

export function useNetworkConfig():NetworkConfig {
	const {VITE_APP_ENV} = import.meta.env;
	const {chainId, address, isConnected} = getAccount(wagmiAdapter.wagmiConfig);
    const isDevelopment = VITE_APP_ENV === 'development';

	useEffect(() => {

        async function loadConfigs() {
            if(chainId){
                setConfigByChainId(chainId);
            }
        }
        
		void loadConfigs();

	}, [chainId]);

	return {
		chainId,
        address,
        isConnected,
        isDevelopment,
	};
}