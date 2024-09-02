import React, { createContext, useContext, useEffect, useCallback, useRef, ReactNode, useState } from 'react';
import { getNetwork } from "@/services/web3.service";
import { useAccount } from 'wagmi';
import { getAllRedemptions, OrderedRedemptions, RedemptionRequest, refreshRedemptions } from '@/services/redemptions.service';
import useSessionStorage from '../app/hooks/useSessionStorage';

type RedemptionContextType = {
    redemptions: OrderedRedemptions;
    loadRedemptions: () => Promise<void>;
    redemptionsLoading: boolean;
};

// Create the context
const RedemptionContext = createContext<RedemptionContextType | undefined>(undefined);

// Export the context
export { RedemptionContext };

export const RedemptionProvider = ({ children }: { children: ReactNode }) => {
    const { address, chainId } = useAccount();
    const [redemptionsLoading, setRedemptionsLoading] = useState<boolean>(false);
    const [redemptions, setRedemptions] = useSessionStorage<OrderedRedemptions>('userRedemptions', {
        claimable: [],
        open: [],
        closed: [],
    });
    const [redemptionsLoaded, setRedemptionsLoaded] = useSessionStorage<boolean>('redemptionsLoaded', false);
    const lastLoadedRef = useRef<number>(Date.now() - 10000);

    const updateUserRedemptions = useCallback(async () => {
        try {
            if (!address || !chainId) return;
            //console.log('Updating user redemptions'); // Temporarily here to confirm no re-renders
            const refreshedRedemptions = await refreshRedemptions(getNetwork(chainId), address, redemptions);
            setRedemptions(refreshedRedemptions);
        } catch (error) {
            setRedemptionsLoading(false);
            console.error('Failed to update user redemptions:', error);
        }
    }, [address, chainId, redemptions, setRedemptions]);

    const loadAllUserRedemptions = useCallback(async () => {
        try {
            if (!address || !chainId) return;
            //console.log('Loading all user redemptions'); // Temporarily here to confirm no re-renders
            const redemptionsFromChain = await getAllRedemptions(getNetwork(chainId), address);
            setRedemptions(redemptionsFromChain);
            setRedemptionsLoaded(true);
        } catch (error) {
            setRedemptionsLoading(false);
            console.error('Failed to load user redemptions:', error);
        }
    }, [address, chainId, setRedemptions, setRedemptionsLoaded]);

    const loadRedemptions = useCallback(async () => {
        const now = Date.now();
        // Don't load redemptions more than once every 5 seconds
        if (now - lastLoadedRef.current < 5000) {
            //console.log('Skipping load, last loaded', now - lastLoadedRef.current, 'ms ago');
            return;
        }
        setRedemptionsLoading(true);
        lastLoadedRef.current = now;
        //console.log('Loading redemptions'); // Temporarily here to confirm no re-renders
        if (redemptionsLoaded) {
            await updateUserRedemptions();
        } else {
            await loadAllUserRedemptions();
        }
        setRedemptionsLoading(false);
    }, [redemptionsLoaded, updateUserRedemptions, loadAllUserRedemptions]);

    useEffect(() => {
        if (address && chainId) {
            loadRedemptions();
        }
    }, [address, chainId, loadRedemptions]);

    const contextValue = {
        redemptions,
        loadRedemptions,
        redemptionsLoading,
    };

    return (
        <RedemptionContext.Provider value={contextValue}>
            {children}
        </RedemptionContext.Provider>
    );
};

export const useRedemptionContext = (): RedemptionContextType => {
    const context = useContext(RedemptionContext);
    if (context === undefined) {
        throw new Error('useRedemptionContext must be used within a RedemptionProvider');
    }
    return context;
};
