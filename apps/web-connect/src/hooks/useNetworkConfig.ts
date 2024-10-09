import { wagmiConfig } from "@/main";
import {useEffect, useState} from "react";
import { getAccount} from '@wagmi/core'
import { setConfig } from "@sentry/core"

interface NetworkConfig {
    chainId: number | undefined;
    address: `0x${string}` | undefined;
    isConnected: boolean;
    isDevelopment: boolean;
}

export function useNetworkConfig():NetworkConfig {
	const {VITE_APP_ENV} = import.meta.env;
	const {chainId, address, isConnected} = getAccount(wagmiConfig);
    const [isDevelopment, setIsDevelopment] = useState(VITE_APP_ENV === 'development');

	useEffect(() => {
		void loadConfigs();

        async function loadConfigs() {
            if(chainId){
                setConfig(chainId);
            }
            setIsDevelopment(VITE_APP_ENV === 'development');
        }

	}, [chainId, VITE_APP_ENV]);

	return {
		chainId,
        address,
        isConnected,
        isDevelopment,
	};
}