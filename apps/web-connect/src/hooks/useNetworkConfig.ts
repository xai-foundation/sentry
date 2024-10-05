import { wagmiConfig } from "@/main";
import {useEffect, useState} from "react";
import { getAccount } from '@wagmi/core'

interface NetworkConfig {
    name: string;
    rpcUrl: string;
    chainId: number;
    refereeAddress: string;
    xaiAddress: string;
    esXaiAddress: string;
    nodeLicenseAddress: string;
    explorer: string;
    xaiRedEnvelope2024Address: string;
    xaiGaslessClaimAddress: string;
    crossmintProjectId: string;
    crossmintCollectionId: string;
    isDevelopment: boolean;
}

export const MAINNET_ID = 42161;
export const TESTNET_ID = 421614;

const MAINNET_CONFIGS: NetworkConfig = {
    name: "Arbitrum",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    chainId: MAINNET_ID,
    refereeAddress: "0xfD41041180571C5D371BEA3D9550E55653671198",
    xaiAddress: "0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66",
    esXaiAddress: "0x4C749d097832DE2FEcc989ce18fDc5f1BD76700c",
    nodeLicenseAddress: "0xbc14d8563b248B79689ECbc43bBa53290e0b6b66",
    explorer: "https://arbiscan.io/",
    xaiRedEnvelope2024Address: "0x080C2e59e963959Bbe9Ea064d1bcBc881F380Ff2",
    xaiGaslessClaimAddress: "0x149107dEB70b9514930d8e454Fc32E77C5ABafE0",
    crossmintProjectId: "",
    crossmintCollectionId: "",
    isDevelopment: false
}

const TESTNET_CONFIGS: NetworkConfig = {
    name: "Arbitrum Sepolia",
    rpcUrl: "https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B",
    chainId: TESTNET_ID,
    refereeAddress: "0xF84D76755a68bE9DFdab9a0b6d934896Ceab957b",
    xaiAddress: "0x724E98F16aC707130664bb00F4397406F74732D0",
    esXaiAddress: "0x5776784C2012887D1f2FA17281E406643CBa5330",
    nodeLicenseAddress: "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2",
    explorer: "https://sepolia.arbiscan.io/",
    xaiRedEnvelope2024Address: "",
    xaiGaslessClaimAddress: "",
    crossmintProjectId: "e1bec541-a95d-4caa-8d1e-6163ab26d754",
    crossmintCollectionId: "eb7239a4-5816-479d-a065-54684543df8f",
    isDevelopment: true
}


export function useNetworkConfig() {
	const {VITE_APP_ENV} = import.meta.env;
	const {chainId} = getAccount(wagmiConfig);
    const [configs, setConfigs] = useState<NetworkConfig>(MAINNET_CONFIGS);
    const [isDevelopment, setIsDevelopment] = useState(VITE_APP_ENV === 'development');

	useEffect(() => {
		void loadConfigs();

        async function loadConfigs() {
            if(chainId === MAINNET_ID){
                setConfigs(MAINNET_CONFIGS);
            } else if(chainId === TESTNET_ID){
                setConfigs(TESTNET_CONFIGS);
            }
            setIsDevelopment(VITE_APP_ENV === 'development');
        }

	}, [chainId, VITE_APP_ENV]);

	return {
		name: configs.name,
		rpcUrl: configs.rpcUrl,
        chainId: chainId,
        refereeAddress: configs.refereeAddress,
        xaiAddress: configs.xaiAddress,
        esXaiAddress: configs.esXaiAddress,
        nodeLicenseAddress: configs.nodeLicenseAddress,
        explorer: configs.explorer,
        xaiRedEnvelope2024Address: configs.xaiRedEnvelope2024Address,
        xaiGaslessClaimAddress: configs.xaiGaslessClaimAddress,
        crossmintProjectId: configs.crossmintProjectId,
        crossmintCollectionId: configs.crossmintCollectionId,
        isDevelopment: isDevelopment
	};
}