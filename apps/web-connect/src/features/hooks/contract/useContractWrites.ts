import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { XaiAbi, NodeLicenseAbi, config } from "@sentry/core";
import { CURRENCIES, Currency, getTokenAddress } from '../shared';

interface UseContractWritesProps {
  quantity: number;
  promoCode: string;
  calculateTotalPrice: () => bigint;
  currency: Currency;
  discount: { applied: boolean; error: boolean };
}

export interface UseContractWritesReturn {
  mintWithEth: ReturnType<typeof useWriteContract>;
  approve: ReturnType<typeof useWriteContract>;
  mintWithXai: ReturnType<typeof useWriteContract>;
  mintWithUsdc: ReturnType<typeof useWriteContract>;
  usdcMintTx: ReturnType<typeof useWaitForTransactionReceipt>;
  approveTx: ReturnType<typeof useWaitForTransactionReceipt>;
  ethMintTx: ReturnType<typeof useWaitForTransactionReceipt>;
  xaiMintTx: ReturnType<typeof useWaitForTransactionReceipt>;
  clearErrors: () => void;
  resetTransactions: () => void;
  mintWithEthError: Error | null;
  handleMintWithEthClicked: () => void;
  handleApproveClicked: () => void;
  handleMintWithTokenClicked: () => void;
}

export function useContractWrites({
  quantity,
  promoCode,
  calculateTotalPrice,
  currency,
}: UseContractWritesProps): UseContractWritesReturn {
  const useEsXai = currency === CURRENCIES.ES_XAI;
  const tokenAddress = getTokenAddress(currency);
  const spender = config.nodeLicenseAddress as `0x${string}`;
  const maxAllowanceAmount = ethers.MaxUint256.toString();
  const [mintWithEthHash, setMintWithEthHash] = useState<`0x${string}` | undefined>(undefined);
  const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>(undefined);
  const [mintWithXaiHash, setMintWithXaiHash] = useState<`0x${string}` | undefined>(undefined);
  const [mintWithUsdcHash, setMintWithUsdcHash] = useState<`0x${string}` | undefined>(undefined);
  const [mintWithEthError, setMintWithEthError] = useState<Error | null>(null);

  const {address} = useAccount();

  const mintWithEthConfig = {
    address: config.nodeLicenseAddress as `0x${string}`,
    abi: NodeLicenseAbi,
    functionName: "mint",
    args: [quantity, promoCode],
    value: calculateTotalPrice(),

    onSuccess: (data: `0x${string}`) => {
      setMintWithEthHash(data);
      setMintWithEthError(null);
    },
    onError: (error: Error) => {
      setMintWithEthHash(undefined);
      setMintWithEthError(error);
      console.error('Error minting with ETH:', error);
    },
  };

  const approveConfig = {
    address: tokenAddress as `0x${string}`,
    abi: XaiAbi,
    functionName: "approve",
    args: [spender, maxAllowanceAmount],
    onSuccess: (data: `0x${string}`) => {
      setApproveHash(data);
    },
    onError: (error: Error) => {
      setApproveHash(undefined);
      console.error('Error approving token:', error);
    },
  };

  const mintWithXaiConfig = {
    address: config.nodeLicenseAddress as `0x${string}`,
    abi: NodeLicenseAbi,
    functionName: "mintWithXai",
    args: [quantity, promoCode, useEsXai, calculateTotalPrice()],
    onSuccess: (data: `0x${string}`) => {
      setMintWithXaiHash(data);
    },
    onError: (error: Error) => {
      setMintWithXaiHash(undefined);
      console.error('Error minting with XAI:', error);
    },
  };

  const handleMintWithEthClicked = async () => {
    mintWithEth.writeContract(mintWithEthConfig);
  };

  const mintWithEth = useWriteContract();  
  const ethMintTx = useWaitForTransactionReceipt({
    hash: mintWithEthHash
  });

  const handleApproveClicked = async () => {
    approve.writeContract(approveConfig);
  };

  const approve = useWriteContract();
  const approveTx = useWaitForTransactionReceipt({
     hash: approveHash,
  });

  const handleMintWithXai = async () => {
    mintWithXai.writeContract(mintWithXaiConfig);
  };

  const mintWithUsdc = useWriteContract();
  const usdcMintTx = useWaitForTransactionReceipt({
    hash: mintWithUsdcHash,
  });

  const mintWithUsdcConfig = {
    address: config.nodeLicenseAddress as `0x${string}`,
    abi: NodeLicenseAbi,
    functionName: "mintToWithUSDC",
    args: [address, quantity, promoCode, (calculateTotalPrice() / 10n ** 12n)],
    onSuccess: (data: `0x${string}`) => {
      setMintWithUsdcHash(data);
    },
    onError: (error: Error) => {
      setMintWithUsdcHash(undefined);
      console.error('Error minting with XAI:', error);
    },
  };

  const handleMintWithUsdc = async () => {
    mintWithUsdc.writeContract(mintWithUsdcConfig);
  }

  const mintWithXai = useWriteContract();
  const xaiMintTx = useWaitForTransactionReceipt({
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

  const handleMintWithTokenClicked = () => {
    if(currency === "USDC"){
      handleMintWithUsdc();
    }
    
    if(currency === "XAI" || currency === "ESXAI"){
      handleMintWithXai();
    }
  }
  


  return {
    mintWithEth,
    ethMintTx,
    approve,
    approveTx,
    mintWithXai,
    mintWithUsdc,
    xaiMintTx,
    usdcMintTx,
    clearErrors,
    mintWithEthError,
    resetTransactions,
    handleMintWithEthClicked,
    handleApproveClicked,
    handleMintWithTokenClicked,
  };
}