import { useContractWrite, UseContractWriteConfig } from 'wagmi';
import { ethers } from 'ethers';
import { XaiAbi, NodeLicenseAbi, config } from "@sentry/core";
import { Abi } from 'viem';
import { CURRENCIES, Currency, getTokenAddress } from '../shared';

interface UseContractWritesProps {
  quantity: number;
  promoCode: string;
  calculateTotalPrice: () => bigint;
  currency: Currency;
  discount: { applied: boolean; error: boolean };
}

type ContractWriteResult = ReturnType<typeof useContractWrite>;

export interface UseContractWritesReturn {
  mintWithEth: ContractWriteResult;
  approve: ContractWriteResult;
  mintWithXai: ContractWriteResult;
}

/**
 * Custom hook to handle contract writes for different actions.
 * @param quantity - Quantity of items to mint.
 * @param promoCode - Promo code to apply.
 * @param calculateTotalPrice - Function to calculate the total price.
 * @param currency - The currency type (e.g., "XAI", "ES_XAI").
 * @param discount - Discount details.
 * @returns An object containing the contract write results for minting with ETH, approving, and minting with XAI.
 */
export function useContractWrites({
  quantity,
  promoCode,
  calculateTotalPrice,
  currency,
  discount,
}: UseContractWritesProps): UseContractWritesReturn {
  const useEsXai = currency === CURRENCIES.ES_XAI;
  const tokenAddress = getTokenAddress(currency);
  const spender = config.nodeLicenseAddress as `0x${string}`;
  const maxAllowanceAmount = ethers.MaxUint256.toString();

  // Configuration for minting with ETH
  const mintWithEthConfig: UseContractWriteConfig = {
    address: config.nodeLicenseAddress as `0x${string}`,
    abi: NodeLicenseAbi as Abi,
    functionName: "mint",
    args: [quantity, promoCode],
    value: discount.applied ? calculateTotalPrice() * BigInt(95) / BigInt(100) : calculateTotalPrice(),
  };

  // Configuration for approving token allowance
  const approveConfig: UseContractWriteConfig = {
    address: tokenAddress as `0x${string}`,
    abi: XaiAbi as Abi,
    functionName: "approve",
    args: [spender, maxAllowanceAmount],
  };

  // Configuration for minting with XAI
  const mintWithXaiConfig: UseContractWriteConfig = {
    address: config.nodeLicenseAddress as `0x${string}`,
    abi: NodeLicenseAbi as Abi,
    functionName: "mintWithXai",
    args: [quantity, promoCode, useEsXai, calculateTotalPrice()],
  };

  const mintWithEth = useContractWrite(mintWithEthConfig);
  const approve = useContractWrite(approveConfig);
  const mintWithXai = useContractWrite(mintWithXaiConfig);

  return {
    mintWithEth,
    approve,
    mintWithXai,
  };
}
