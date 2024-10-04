import { useState, useEffect, useCallback } from 'react';
import { getEsXaiAllowance, getXaiAllowance, config } from "@sentry/core";
import { CURRENCIES, Currency } from '..';

// Define TypeScript types for better type safety
interface AllowanceResponse {
  approvalAmount: bigint;
}

/**
 * Custom hook to handle currency allowances.
 * Manages the token allowance state and provides a function to refetch the allowance.
 * @param currency - The currency type (e.g., "XAI", "ES_XAI").
 * @param address - The address for which to fetch the allowance.
 * @returns An object containing the token allowance and a function to refetch the allowance.
 */
export function useCurrencyHandler(currency: Currency, address: string | undefined) {
  const [tokenAllowance, setTokenAllowance] = useState<bigint>(0n);

  /**
   * Fetches the allowance for the specified currency and address.
   * Updates the token allowance state based on the fetched data.
   */
  const fetchAllowance = useCallback(async () => {
    if (!address) return;

    try {
      if (currency === CURRENCIES.AETH) {
        setTokenAllowance(0n);
      } else {
        const allowance: AllowanceResponse = currency === CURRENCIES.XAI
          ? await getXaiAllowance(address, config.nodeLicenseAddress)
          : await getEsXaiAllowance(address, config.nodeLicenseAddress);
        setTokenAllowance(allowance.approvalAmount);
      }
    } catch (error) {
      console.error('Failed to fetch allowance:', error);
      setTokenAllowance(0n); // Optionally, set to a fallback value on error
    }
  }, [currency, address]);

  // Fetch allowance whenever the currency or address changes
  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  return { tokenAllowance, refetchAllowance: fetchAllowance };
}
