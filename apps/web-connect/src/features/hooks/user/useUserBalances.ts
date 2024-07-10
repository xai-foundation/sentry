import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { getEsXaiBalance, getXaiBalance, getWalletBalance } from "@sentry/core";
import { CURRENCIES, Currency } from '..';

/**
 * Custom hook to fetch and manage user balances.
 * @param currency - The currency type (e.g., "XAI", "ES_XAI").
 * @returns An object containing the token balance, ETH balance, and a function to refetch balances.
 */
export function useUserBalances(currency: Currency) {
  const { address } = useAccount();
  const [tokenBalance, setTokenBalance] = useState<bigint>(0n);
  const [ethBalance, setEthBalance] = useState<bigint>(0n);

  /**
   * Function to fetch the user's ETH and token balances.
   * Uses async/await to fetch balances and updates state accordingly.
   * Includes error handling to manage potential issues during balance fetch.
   */
  const fetchBalances = useCallback(async () => {
    if (!address) return;

    try {
      const ethBalance = await getWalletBalance(address);
      setEthBalance(ethBalance);

      let tokenBalance = 0n;
      switch (currency) {
        case CURRENCIES.XAI:
          tokenBalance = (await getXaiBalance(address)).balance;
          break;
        case CURRENCIES.ES_XAI:
          tokenBalance = (await getEsXaiBalance(address)).balance;
          break;
      }
      setTokenBalance(tokenBalance);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  }, [currency, address]);

  // Fetch balances whenever address or currency changes
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { tokenBalance, ethBalance, refetchBalances: fetchBalances };
}
