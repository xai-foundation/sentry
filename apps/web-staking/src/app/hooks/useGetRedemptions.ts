import { useEffect, useRef, useState } from 'react';
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
    const [redemptionsLoading, setRedemptionsLoading] = useState<boolean>(false);
    
    // Create wallet-specific storage keys - this ensures each wallet address has its own isolated storage
    // When address changes, useSessionStorage will automatically reset to INITIAL_REDEMPTIONS
    const storageKey = address ? `userRedemptions-${address}` : 'userRedemptions';
    const loadedKey = address ? `redemptionsLoaded-${address}` : 'redemptionsLoaded';
    
    const [redemptions, setRedemptions] = useSessionStorage<OrderedRedemptions>(storageKey, INITIAL_REDEMPTIONS);
    const [redemptionsLoaded, setRedemptionsLoaded] = useSessionStorage<boolean>(loadedKey, false);

    // Track last load time to prevent excessive reloads
    const lastLoadedRef = useRef<number>(Date.now() - 5000);

    const loadRedemptions = async (currentAddress: string, currentChainId: number, currentRedemptions: OrderedRedemptions, redemptionsLoaded: boolean) => {
        // Return early if requirements are not met
        if (!currentAddress || !currentChainId || !isConnected) {
            return;
        }

        // Check to prevent stale updates if the address changed while loading
        // This is required to prevent race conditions when loading redemptions after an address change
        if (currentAddress !== address) {
            return;
        }

        const now = Date.now();
        // Throttle loads to maximum once per second
        if (now - lastLoadedRef.current > 1000) {
            lastLoadedRef.current = now;
            setRedemptionsLoading(true);

            try {
                if (!redemptionsLoaded) {
                    // Initial load - get all redemptions
                    const redemptionsFromChain = await getAllRedemptions(getNetwork(currentChainId), currentAddress);
                    // Double-check address hasn't changed during the async call. This is required to prevent race conditions when loading redemptions after an address change
                    if (currentAddress === address) {
                        setRedemptions(redemptionsFromChain);
                        setRedemptionsLoaded(true);
                    }
                } else {
                    // Refresh existing redemptions
                    const refreshedRedemptions = await refreshRedemptions(getNetwork(currentChainId), currentAddress, currentRedemptions);
                    // Double-check address hasn't changed during the async call. This is required to prevent race conditions when loading redemptions after an address change
                    if (currentAddress === address) {
                        setRedemptions(refreshedRedemptions);
                    }
                }
            } catch (error) {
                console.error('Failed to load/update redemptions:', error);
                // Only reset if error occurred for current address to avoid clearing new address's data
                if (currentAddress === address) {
                    setRedemptionsLoaded(false);
                    setRedemptions(INITIAL_REDEMPTIONS);
                }
            } finally {
                // Clear loading state if we're still on the same address
                if (currentAddress === address) {
                    setRedemptionsLoading(false);
                }
            }
        }
    };

    useEffect(() => {
        // Reset loading state when disconnected or requirements not met
        if (!address || !chainId || !isConnected) {
            setRedemptionsLoading(false);
            return;
        }

        // On address/chain change, pass INITIAL_REDEMPTIONS to force a fresh load
        // useSessionStorage will have already reset the storage due to key change
        loadRedemptions(address, chainId, INITIAL_REDEMPTIONS, false);
    }, [address, chainId, isConnected]);

    return {
        redemptions,
        loadRedemptions: () => loadRedemptions(address!, chainId!, redemptions, redemptionsLoaded),
        redemptionsLoading,
    };
};

export default useGetRedemptions;