import { useState } from 'react';
import { useContractWrite, useWaitForTransaction, UseContractWriteConfig } from 'wagmi';
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

export interface UseContractWritesReturn {
  mintWithEth: ReturnType<typeof useContractWrite>;
  approve: ReturnType<typeof useContractWrite>;
  mintWithXai: ReturnType<typeof useContractWrite>;
  approveTx: ReturnType<typeof useWaitForTransaction>;
  ethMintTx: ReturnType<typeof useWaitForTransaction>;
  xaiMintTx: ReturnType<typeof useWaitForTransaction>;
  clearErrors: () => void;
  resetTransactions: () => void;
  mintWithEthError: Error | null;
}

interface ExtendedUseContractWriteConfig extends UseContractWriteConfig {
  onProgress?: () => void;
  onSuccess?: (data: { hash: string }) => void;
  onError?: (error: Error) => void;
}

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
  const [mintWithEthHash, setMintWithEthHash] = useState<`0x${string}` | undefined>(undefined);
  const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>(undefined);
  const [mintWithXaiHash, setMintWithXaiHash] = useState<`0x${string}` | undefined>(undefined);
  const [mintWithEthError, setMintWithEthError] = useState<Error | null>(null);
  const mintWithEthConfig: ExtendedUseContractWriteConfig = {
    address: config.nodeLicenseAddress as `0x${string}`,
    abi: NodeLicenseAbi as Abi,
    functionName: "mint",
    args: [quantity, promoCode],
    value: discount.applied ? calculateTotalPrice() * BigInt(95) / BigInt(100) : calculateTotalPrice(),
    onSuccess: (data) => {
      setMintWithEthHash(data.hash as `0x${string}`);
      setMintWithEthError(null);
    },
    onError: (error) => {
      setMintWithEthHash(undefined);
      setMintWithEthError(error);
      console.error('Error minting with ETH:', error);
    },
  };

  const approveConfig: ExtendedUseContractWriteConfig = {
    address: tokenAddress as `0x${string}`,
    abi: XaiAbi as Abi,
    functionName: "approve",
    args: [spender, maxAllowanceAmount],
    onSuccess: (data) => {
      setApproveHash(data.hash as `0x${string}`);
    },
    onError: (error) => {
      setApproveHash(undefined);
      console.error('Error approving token:', error);
    },
  };

  const mintWithXaiConfig: ExtendedUseContractWriteConfig = {
    address: config.nodeLicenseAddress as `0x${string}`,
    abi: NodeLicenseAbi as Abi,
    functionName: "mintWithXai",
    args: [quantity, promoCode, useEsXai, calculateTotalPrice()],
    onSuccess: (data) => {
      setMintWithXaiHash(data.hash as `0x${string}`);
    },
    onError: (error) => {
      setMintWithXaiHash(undefined);
      console.error('Error minting with XAI:', error);
    },
  };

  const mintWithEth = useContractWrite(mintWithEthConfig);
  const ethMintTx = useWaitForTransaction({
    hash: mintWithEthHash
  });

  const approve = useContractWrite(approveConfig);
  const approveTx = useWaitForTransaction({
     hash: approveHash,
  });


  const mintWithXai = useContractWrite(mintWithXaiConfig);
  const xaiMintTx = useWaitForTransaction({
    hash: mintWithXaiHash,
  });

  const clearErrors = () => {
    setMintWithEthHash(undefined);
    setApproveHash(undefined);
    setMintWithXaiHash(undefined);
    setMintWithEthError(null);
  };  

  const resetTransactions = () => {
    setMintWithEthHash(undefined);
    setApproveHash(undefined);
    setMintWithXaiHash(undefined);
    setMintWithEthError(null);
    mintWithEth.reset();
    approve.reset();
    mintWithXai.reset();
  };
  


  return {
    mintWithEth,
    ethMintTx,
    approve,
    approveTx,
    mintWithXai,
    xaiMintTx,
    clearErrors,
    mintWithEthError,
    resetTransactions,
  };
}