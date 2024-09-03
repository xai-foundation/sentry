import { useCallback, useEffect, useRef, useState } from 'react';
import { getNetwork } from "@/services/web3.service";
import { useAccount } from 'wagmi';
import { getAllRedemptions, OrderedRedemptions, refreshRedemptions } from '@/services/redemptions.service';
import useSessionStorage from './useSessionStorage';

const useGetRedemptions = () => {
    const { address, chainId } = useAccount();
    const [redemptionsLoading, setRedemptionsLoading] = useState<boolean>(false);
    const [redemptions, setRedemptions] = useSessionStorage<OrderedRedemptions>('userRedemptions', {
        claimable: [],
        open: [],
        closed: [],
    });
    const [redemptionsLoaded, setRedemptionsLoaded] = useSessionStorage<boolean>('redemptionsLoaded', false);
    const lastLoadedRef = useRef<number>(Date.now() - 5000);

    const updateUserRedemptions = useCallback(async () => {
        try {
            if (!address || !chainId) return;
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
        if (now - lastLoadedRef.current < 1000) {
            return;
        }
        setRedemptionsLoading(true);
        lastLoadedRef.current = now;
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

    return {
        redemptions,
        loadRedemptions,
        redemptionsLoading,
    };
};

export default useGetRedemptions;
