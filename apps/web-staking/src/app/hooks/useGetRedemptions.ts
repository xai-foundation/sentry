import { useEffect, useState, useRef } from 'react';
import { getNetwork } from "@/services/web3.service";
import { useAccount } from 'wagmi';
import { getAllRedemptions, OrderedRedemptions, refreshRedemptions } from '@/services/redemptions.service';

interface UseGetRedemptionsResult {
    redemptions: OrderedRedemptions;
    loadRedemptions: () => void;
    redemptionsLoading: boolean;
}

const INITIAL_REDEMPTIONS: OrderedRedemptions = {
    claimable: [],
    open: [],
    closed: [],
};

const THROTTLE_DELAY = 1000;

const getStorageValue = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const useGetRedemptions = (): UseGetRedemptionsResult => {
    const { address, chainId, isConnected } = useAccount();
    const [redemptionsLoading, setRedemptionsLoading] = useState<boolean>(false);
    const [redemptions, setRedemptions] = useState<OrderedRedemptions>(() => 
        getStorageValue(`userRedemptions-${address}`, INITIAL_REDEMPTIONS)
    );

    const lastLoadTimeRef = useRef<number>(0);
    const hasMountedRef = useRef(false); // Track mount status to avoid initial storage sync

    // Sync state with session storage after initial mount
    useEffect(() => {
        if (address && hasMountedRef.current) {
            sessionStorage.setItem(`userRedemptions-${address}`, JSON.stringify(redemptions));
        }
        hasMountedRef.current = true; // Set mounted flag
    }, [redemptions, address]);

    // Clear state when address changes, disconnects, or chain changes
    useEffect(() => {
        if (!address || !isConnected || !chainId) {
            setRedemptions(INITIAL_REDEMPTIONS);
            setRedemptionsLoading(false);
            lastLoadTimeRef.current = 0;
        }
    }, [address, isConnected, chainId]);

    const performLoadRedemptions = async (initialLoad: boolean = false) => {
        if (!address || !chainId || !isConnected) {
            setRedemptionsLoading(false);
            return;
        }

        const now = Date.now();
        if (now - lastLoadTimeRef.current < THROTTLE_DELAY) {
            return;
        }
        lastLoadTimeRef.current = now;
        
        const currentAddress = address;

        setRedemptionsLoading(true);

        try {
            if (initialLoad || redemptions === INITIAL_REDEMPTIONS) {
                const redemptionsFromChain = await getAllRedemptions(
                    getNetwork(chainId), 
                    currentAddress
                );
                if (currentAddress === address) {
                    setRedemptions(redemptionsFromChain);
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
        } catch (err) {
            console.error('Failed to load/update redemptions:', err);
            if (currentAddress === address) {
                setRedemptions(INITIAL_REDEMPTIONS);
            }
        } finally {
            if (currentAddress === address) {
                setRedemptionsLoading(false);
            }
        }
    };

    // Load redemptions after address/chain change
    useEffect(() => {
        if (address && chainId && isConnected) {
            performLoadRedemptions(true);
        }
    }, [address, chainId, isConnected]);

    return {
        redemptions,
        loadRedemptions: () => performLoadRedemptions(false),
        redemptionsLoading,
    };
};

export default useGetRedemptions;
