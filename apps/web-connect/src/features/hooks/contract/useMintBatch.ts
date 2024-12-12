import { useState } from 'react';
import {  useAccount, useWriteContract } from 'wagmi';
import { NodeLicenseAbi, config } from "@sentry/core";
import { CURRENCIES, Currency } from '../shared';

//const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const MAX_BATCH_SIZE = 2; // TODO Update Limit batch size to 175 after testing

interface UseMintBatchProps {
  promoCode: string;
  calculateTotalPrice: () => bigint;
  currency: Currency;
}

export interface UseMintBatchReturn {
  txHashes: string[];
  mintBatchError: Error | undefined;
  isBatchMinting: boolean;
  clearMintBatchErrors: () => void;
  resetMintBatchTransactions: () => void;
  mintBatch: (qtyToMint: number) => Promise<void>;
  batchMintTx: ReturnType<typeof useWriteContract>
}

type MintConfig = {
  address: `0x${string}`;
  abi: typeof NodeLicenseAbi;
  functionName: string;
  args: unknown[];
  value?: bigint;
  onSuccess: (data: `0x${string}`) => void;
  onError: (error: Error) => void;
}

export function useMintBatch({
  promoCode,
  calculateTotalPrice,
  currency,
}: UseMintBatchProps): UseMintBatchReturn {
  const [txHashes, setTxHashes] = useState<string[]>([]);
  const [mintBatchError, setMintBatchError] = useState<Error | undefined>(undefined);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const { address } = useAccount();
  const batchMintTx = useWriteContract();

  const getConfig = (quantity: number) => {
    const functionName = currency === CURRENCIES.AETH ? "mint" : "mintWithXai";
    const mintWithEthArgs = [quantity, promoCode];
    const mintWithXaiArgs = [address, quantity, promoCode, currency === CURRENCIES.ES_XAI, calculateTotalPrice()];
    const args = currency === CURRENCIES.AETH ? mintWithEthArgs : mintWithXaiArgs;

    return {
      address: config.nodeLicenseAddress as `0x${string}`,
      abi: NodeLicenseAbi,
      functionName,
      args,
      value: currency === CURRENCIES.AETH ? calculateTotalPrice() : undefined,
      onSuccess: () => {
        setMintBatchError(undefined);
      },
      onError: (error: Error) => {
        setMintBatchError(error);
        console.error('Error minting:', error);
      },
    }
  }

  const mintBatch = async (qtyToMint: number) => {
    setTxHashes([]);
    const config = getConfig(qtyToMint);
    executeMint(qtyToMint, config);
  }

  const executeMint = async (qtyToMint: number, config: MintConfig) => {
    let qtyRemaining = qtyToMint; 
    setMintBatchError(undefined);
    const txHashesLocal: string[] = []; // Local variable to accumulate hashes
    const batches = Math.ceil(qtyToMint / MAX_BATCH_SIZE); // TODO Update Limit batch size to 175

  setIsMinting(true);

    for (let i = 0; i < batches; i++) {
      if (mintBatchError) return;
      const qtyToProcess = Math.min(qtyRemaining, MAX_BATCH_SIZE);
      try {
        // Initiate transaction
        const result = await batchMintTx.writeContractAsync(config);
        txHashesLocal.push(result);
        qtyRemaining -= qtyToProcess;

        // Transactions fail if they are sent too quickly when minting with an ERC20 token
        // AETH seems to not experience this issue
        if(currency !== CURRENCIES.AETH){
          // If not AETH, wait 3 seconds between transactions
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        // Reset for the next iteration
        batchMintTx.reset();
      } catch (error) {
        console.error('Error minting:', error);
        setMintBatchError(error as Error);
        setIsMinting(false);
      }
    }
  
    setIsMinting(false);

    setTxHashes(txHashesLocal);
    console.log("txHashes", txHashes);
  };
  
  const clearMintBatchErrors = () => {
    setMintBatchError(undefined);
    batchMintTx.reset();
  };

  const resetMintBatchTransactions = () => {
    setMintBatchError(undefined);
    setTxHashes([]);
    batchMintTx.reset();
  };



  return {
    clearMintBatchErrors,
    mintBatchError,
    resetMintBatchTransactions,
    mintBatch,
    txHashes,
    isBatchMinting: isMinting,
    batchMintTx,
  };
}