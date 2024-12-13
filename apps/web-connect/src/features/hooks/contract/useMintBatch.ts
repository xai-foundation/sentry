import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { NodeLicenseAbi, config } from "@sentry/core";
import { CURRENCIES, Currency } from "../shared";
import { errorNotification, successNotification } from "@/features/checkout/components/notifications/NotificationsComponent";
import { getPriceForQuantity as getPriceForQuantityCore } from "@sentry/core";
import { convertEthAmountToXaiAmount } from "@/utils/convertEthAmountToXaiAmount";

export const MAX_BATCH_SIZE = 2;

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

  const getConfig = (quantity: number, totalPrice: bigint): MintConfig => {
    const functionName = currency === CURRENCIES.AETH ? "mint" : "mintWithXai";
    const mintWithEthArgs = [quantity, promoCode];
    const mintWithXaiArgs = [
      address,
      quantity,
      promoCode,
      currency === CURRENCIES.ES_XAI,
      totalPrice,
    ];
    const args =
      currency === CURRENCIES.AETH ? mintWithEthArgs : mintWithXaiArgs;

    return {
      address: config.nodeLicenseAddress as `0x${string}`,
      abi: NodeLicenseAbi,
      functionName,
      args,
      value: currency === CURRENCIES.AETH ? totalPrice : 0n,
      onSuccess: () => {
        setMintBatchError(undefined);
      },
      onError: (error: Error) => {
        setMintBatchError(error);
        console.error("Error minting:", error);
      },
    };
  };

  const mintBatch = async (qtyToMint: number) => {
    //const totalEthPriceInWei = calculateTotalPrice();
    //const expectedAvg = totalEthPriceInWei / BigInt(qtyToMint);
    //console.log("expectedAvg: ", expectedAvg);
    setTxHashes([]);
    executeMint(qtyToMint, 0n); // TODO Pass the correct average after testing U/I
  };

  const executeMint = async (qtyToMint: number, calculatedAverage: bigint) => {
    let qtyRemaining = qtyToMint;
    setMintBatchError(undefined);
    const txHashesLocal: string[] = []; // Local variable to accumulate hashes
    const batches = Math.ceil(qtyToMint / MAX_BATCH_SIZE);
    let expectedAveragePrice = calculatedAverage;

    setIsMinting(true);
    let encounteredError = false; // Local error flag

    for (let i = 0; i < batches; i++) {
      if (encounteredError) break; // Exit loop if an error is encountered

      const qtyToProcess = Math.min(qtyRemaining, MAX_BATCH_SIZE);
      try {
        // Initiate transaction
        const priceResult = await getPriceForQuantityCore(Number(qtyToProcess));
        const priceToUse =  currency === CURRENCIES.AETH ? priceResult.price : await convertEthAmountToXaiAmount(priceResult.price);
        const itemPriceAvg = priceToUse / BigInt(qtyToProcess);
        if(itemPriceAvg > expectedAveragePrice) {
          errorNotification("Price has changed. Please review and confirm the new price.");
          expectedAveragePrice = itemPriceAvg;
        } 

        const config = getConfig(qtyToProcess, priceToUse);
        const result = await batchMintTx.writeContractAsync(config);
        txHashesLocal.push(result);
        qtyRemaining -= qtyToProcess;
        successNotification(`Mint Batch ${i + 1} of ${batches} successful`);

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
        errorNotification("Error minting: " + (error as Error).message);
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
