import { useState, useEffect, useCallback } from 'react';
import { getTokenAllowance } from "@sentry/core";
import { CURRENCIES, Currency } from '..';
import { useNetworkConfig } from '../../../hooks/useNetworkConfig';

// Define TypeScript types for better type safety
interface AllowanceResponse {
  approvalAmount: bigint;
}

/**
 * Custom hook to handle currency allowances.
 * Manages the token allowance state and provides a function to refetch the allowance.
 * @param currency - The currency type (e.g., "XAI", "ES_XAI").
 * @param walletAddress - The address for which to fetch the allowance.
 * @returns An object containing the token allowance and a function to refetch the allowance.
 */
export function useCurrencyHandler(currency: Currency, walletAddress: string | undefined) {
  const [tokenAllowance, setTokenAllowance] = useState<bigint>(0n);
	const { nodeLicenseAddress, esXaiAddress, xaiAddress, rpcUrl} = useNetworkConfig();

  /**
   * Fetches the allowance for the specified currency and address.
   * Updates the token allowance state based on the fetched data.
   */
  const fetchAllowance = useCallback(async () => {
    if (!walletAddress) return;

    try {
      if (currency === CURRENCIES.AETH) {
        setTokenAllowance(0n);
      } else {
        const allowance: AllowanceResponse = currency === CURRENCIES.XAI
          ? (await getTokenAllowance(walletAddress, xaiAddress, nodeLicenseAddress, rpcUrl))
          : (await getTokenAllowance(walletAddress, esXaiAddress, nodeLicenseAddress, rpcUrl))
        setTokenAllowance(allowance.approvalAmount);
      }
    } catch (error) {
      console.error('Failed to fetch allowance:', error);
      setTokenAllowance(0n); // Optionally, set to a fallback value on error
    }
  }, [currency, walletAddress, nodeLicenseAddress, esXaiAddress, xaiAddress, rpcUrl]);

  // Fetch allowance whenever the currency or address changes
  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  return { tokenAllowance, refetchAllowance: fetchAllowance };
}
