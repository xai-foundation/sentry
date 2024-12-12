import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { NodeLicenseAbi, config } from "@sentry/core";
import { CURRENCIES, Currency } from "../shared";

export const MAX_BATCH_SIZE = 175;

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
  batchMintTx: ReturnType<typeof useWriteContract>;
}

type MintConfig = {
  address: `0x${string}`;
  abi: typeof NodeLicenseAbi;
  functionName: string;
  args: unknown[];
  value?: bigint;
  onSuccess: (data: `0x${string}`) => void;
  onError: (error: Error) => void;
};

export function useMintBatch({
  promoCode,
  calculateTotalPrice,
  currency,
}: UseMintBatchProps): UseMintBatchReturn {
  const [txHashes, setTxHashes] = useState<string[]>([]);
  const [mintBatchError, setMintBatchError] = useState<Error | undefined>(
    undefined
  );
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const { address } = useAccount();
  const batchMintTx = useWriteContract();

  const getMintWithEthConfig = (quantity: number): MintConfig => {
    return{
      address: config.nodeLicenseAddress as `0x${string}`,
      abi: NodeLicenseAbi,
      functionName: "mint",
      args: [quantity, promoCode],
      value: calculateTotalPrice(),
      onSuccess: () => {
        setMintBatchError(undefined);
      },
      onError: (error: Error) => {
        setMintBatchError(error);
        console.error('Error minting with XAI:', error);
      },
    }
  }


  const getMintWithXaiConfig = (quantity: number): MintConfig => {
    return {
      address: config.nodeLicenseAddress as `0x${string}`,
      abi: NodeLicenseAbi,
      functionName: "mintWithXai",
      args: [address, quantity, promoCode, currency === CURRENCIES.ES_XAI, calculateTotalPrice()],
      onSuccess: () => {
        setMintBatchError(undefined);
      },
      onError: (error: Error) => {
        setMintBatchError(error);
        console.error('Error minting with XAI:', error);
      },
    };
  }

  const getConfig = (quantity: number): MintConfig => {
    return currency === CURRENCIES.AETH ? getMintWithEthConfig(quantity) : getMintWithXaiConfig(quantity);
  };

  const mintBatch = async (qtyToMint: number) => {
    setTxHashes([]);
    executeMint(qtyToMint);
  };

  const executeMint = async (qtyToMint: number) => {
    let qtyRemaining = qtyToMint;
    setMintBatchError(undefined);
    const txHashesLocal: string[] = []; // Local variable to accumulate hashes
    const batches = Math.ceil(qtyToMint / MAX_BATCH_SIZE);

    setIsMinting(true);
    let encounteredError = false; // Local error flag

    for (let i = 0; i < batches; i++) {
      if (encounteredError) break; // Exit loop if an error is encountered

      const qtyToProcess = Math.min(qtyRemaining, MAX_BATCH_SIZE);
      try {
        // Initiate transaction        
        const config = getConfig(qtyToProcess);
        const result = await batchMintTx.writeContractAsync(config);
        txHashesLocal.push(result);
        qtyRemaining -= qtyToProcess;

        // Transactions fail if they are sent too quickly when minting with an ERC20 token
        // AETH seems to not experience this issue
        if (currency !== CURRENCIES.AETH) {
          // If not AETH, wait 3 seconds between transactions
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        // Reset for the next iteration
        batchMintTx.reset();
      } catch (error) {
        console.error("Error minting:", error);
        setMintBatchError(error as Error);
        encounteredError = true; // Update the local error flag
        setIsMinting(false);
      }
    }

    setIsMinting(false);

    if (!encounteredError) {
      setTxHashes(txHashesLocal);
    }
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
