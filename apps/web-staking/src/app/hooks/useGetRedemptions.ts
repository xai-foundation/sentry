import { useEffect, useState, useCallback, useRef } from 'react';
import { getNetwork } from "@/services/web3.service";
import { useAccount } from 'wagmi';
import { getAllRedemptions, OrderedRedemptions, refreshRedemptions } from '@/services/redemptions.service';

const INITIAL_REDEMPTIONS: OrderedRedemptions = {
    claimable: [],
    open: [],
    closed: [],
};

const THROTTLE_DELAY = 1000;

const getStorageValue = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const stored = window.sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const useGetRedemptions = () => {
    const { address, chainId, isConnected } = useAccount();
    const [redemptionsLoading, setRedemptionsLoading] = useState<boolean>(false);
    
    const storageKey = address ? `userRedemptions-${address}` : 'userRedemptions';
    const loadedKey = address ? `redemptionsLoaded-${address}` : 'redemptionsLoaded';

    const [redemptions, setRedemptions] = useState<OrderedRedemptions>(() => 
        getStorageValue(storageKey, INITIAL_REDEMPTIONS)
    );
    const [redemptionsLoaded, setRedemptionsLoaded] = useState<boolean>(() => 
        getStorageValue(loadedKey, false)
    );

    const lastLoadedRef = useRef<number>(Date.now() - THROTTLE_DELAY);

    // Sync state with session storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(storageKey, JSON.stringify(redemptions));
            window.sessionStorage.setItem(loadedKey, JSON.stringify(redemptionsLoaded));
        }
    }, [redemptions, redemptionsLoaded, storageKey, loadedKey]);

    // Clear state when disconnected
    useEffect(() => {
        if (!isConnected) {
            setRedemptions(INITIAL_REDEMPTIONS);
            setRedemptionsLoaded(false);
            setRedemptionsLoading(false);
        }
    }, [isConnected]);

    const performLoadRedemptions = async (initialLoad: boolean = false) => {
        if (!address || !chainId || !isConnected) {
            setRedemptionsLoading(false);
            return;
        }

        const now = Date.now();
        if (now - lastLoadedRef.current <= THROTTLE_DELAY) return;
        lastLoadedRef.current = now;

        setRedemptionsLoading(true);
        const currentAddress = address;

        try {
            if (initialLoad || !redemptionsLoaded) {
                const redemptionsFromChain = await getAllRedemptions(
                    getNetwork(chainId), 
                    currentAddress
                );
                if (currentAddress === address) {
                    setRedemptions(redemptionsFromChain);
                    setRedemptionsLoaded(true);
                }
            } else {
                const refreshedRedemptions = await refreshRedemptions(
                    getNetwork(chainId), 
                    currentAddress, 
                    redemptions
                );
                if (currentAddress === address) {
                    setRedemptions(refreshedRedemptions);
                }
            }
        } catch (error) {
            console.error('Failed to load/update redemptions:', error);
            if (currentAddress === address) {
                setRedemptionsLoaded(false);
                setRedemptions(INITIAL_REDEMPTIONS);
            }
        } finally {
            if (currentAddress === address) {
                setRedemptionsLoading(false);
            }
        }
    };

    // Load redemptions on address/chain change
    useEffect(() => {
        performLoadRedemptions(true);
    }, [address, chainId]);

    // Public trigger function
    const triggerLoadRedemptions = () => {
        performLoadRedemptions(false);
    };

    return {
        redemptions,
        loadRedemptions: triggerLoadRedemptions,
        redemptionsLoading,
    };
};

export default useGetRedemptions;