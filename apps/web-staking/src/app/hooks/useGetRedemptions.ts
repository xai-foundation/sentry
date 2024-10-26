import { useCallback, useEffect, useRef, useState } from 'react';
import { getNetwork } from "@/services/web3.service";
import { useAccount } from 'wagmi';
import { getAllRedemptions, OrderedRedemptions, refreshRedemptions } from '@/services/redemptions.service';
import useSessionStorage from './useSessionStorage';

const INITIAL_REDEMPTIONS: OrderedRedemptions = {
    claimable: [],
    open: [],
    closed: [],
};

const useGetRedemptions = () => {
    const { address, chainId, isConnected } = useAccount();
    const [loadedAddress, setLoadedAddress] = useState<`0x${string}` | undefined>(undefined);
    const [redemptionsLoading, setRedemptionsLoading] = useState<boolean>(false);
    const [redemptions, setRedemptions] = useSessionStorage<OrderedRedemptions>('userRedemptions', INITIAL_REDEMPTIONS);
    const [redemptionsLoaded, setRedemptionsLoaded] = useSessionStorage<boolean>('redemptionsLoaded', false);
    const lastLoadedRef = useRef<number>(Date.now() - 5000);


    const loadRedemptions = useCallback(async () => {
        if (!address || !chainId || !isConnected) {
            console.log("Cannot load redemptions - missing requirements", { address, chainId, isConnected });
            return;
        }
        const now = Date.now();
        // Do not reload if already loaded in the last second
        if (now - lastLoadedRef.current > 1000) {
            lastLoadedRef.current = now;

            setRedemptionsLoading(true);
            try {
                // If address changed or not loaded yet, do a fresh load
                if (loadedAddress !== address || !redemptionsLoaded) {
                    const redemptionsFromChain = await getAllRedemptions(getNetwork(chainId), address);
                    setRedemptions(redemptionsFromChain);
                    setRedemptionsLoaded(true);
                } else {
                    const refreshedRedemptions = await refreshRedemptions(getNetwork(chainId), address, redemptions);
                    setRedemptions(refreshedRedemptions);
                }
            } catch (error) {
                console.error('Failed to load/update redemptions:', error);
                setRedemptionsLoaded(false);
                setRedemptions(INITIAL_REDEMPTIONS);
            } finally {
                setRedemptionsLoading(false);
            }
        }
    }, [
        address,
        chainId,
        isConnected,
        loadedAddress,
        redemptionsLoaded,
        redemptions,
        setRedemptions,
        setRedemptionsLoaded,
    ]);

    useEffect(() => {
        // Reset if disconnected or chain changed
        if (!address || !chainId || !isConnected) {
            setRedemptionsLoaded(false);
            setRedemptions(INITIAL_REDEMPTIONS);
            setLoadedAddress(undefined);
            return;
        }

        // Handle address change
        if (loadedAddress !== address) {
            setRedemptionsLoaded(false);
            setRedemptions(INITIAL_REDEMPTIONS);
            setLoadedAddress(address);
        }

        loadRedemptions();
    }, [address, chainId, isConnected, loadedAddress]);

    return {
        redemptions,
        loadRedemptions,
        redemptionsLoading,
    };
};

export default useGetRedemptions;