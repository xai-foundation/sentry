"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import PoolTierCard from "@/app/components/pool/PoolTierCard";
import HeadlineComponent from "@/app/components/summary/HeadlineComponent";
import StakingCards from "@/app/components/summary/StakingCards";
import SummaryDescriptions from "@/app/components/summary/summaryDescriptions/SummaryDescriptions";
import { useGetUnstakeRequests, useGetUserPoolInfo } from "@/app/hooks/hooks";
import {
  UnstakeRequest,
  mapWeb3Error,
  updateRequestClaimed,
  getNetwork,
} from "@/services/web3.service";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";

import { ButtonBack } from "../buttons/ButtonsComponent";
import {
  loadingNotification,
  updateNotification,
} from "../notifications/NotificationsComponent";
import { Id } from "react-toastify";
import { useGetTiers } from "@/app/hooks/useGetTiers";

const SummaryComponent = ({ isBannedPool }: { isBannedPool: boolean }) => {
  const router = useRouter();
  const [refreshPoolInfo, setRefreshPoolInfo] = useState(false);
  const [refreshUnstakeRequests, setRefreshUnstakeRequests] = useState(false);
  // const [poolInfo, setData] = useState<PoolInfo>();
  const { tiers } = useGetTiers();

  const { address, chainId } = useAccount();
  const { poolAddress } = useParams<{ poolAddress: string }>();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { unstakeRequests } = useGetUnstakeRequests(
    poolAddress,
    refreshUnstakeRequests,
  );

  const [isClaimRequest, setIsClaimRequest] = useState(false);
  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
  const toastId = useRef<Id>();
  const [unstakeRequestIndex, setUnstakeRequestIndex] = useState<number>();

  // Substitute Timeouts with useWaitForTransaction
  const { data, isError, isLoading, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
  });

  const { userPool: poolInfo } = useGetUserPoolInfo(
    poolAddress,
    refreshPoolInfo,
  );

  const updateOnSuccess = useCallback(() => {
    updateNotification(
      "Successfully claimed",
      toastId.current as Id,
      false,
      receipt,
      chainId,
    );
    setRefreshPoolInfo(r => { return !r });
    if (isClaimRequest && typeof unstakeRequestIndex !== undefined) {
      updateRequestClaimed(
        getNetwork(chainId),
        address!,
        poolAddress,
        unstakeRequestIndex as number,
      );
      setRefreshUnstakeRequests(r => { return !r });
    }
  }, [address, chainId, poolAddress, isClaimRequest, receipt, unstakeRequestIndex]);

  const updateOnError = useCallback(() => {
    const error = mapWeb3Error(status);
    updateNotification(error, toastId.current as Id, true);
  }, [status]);

  useEffect(() => {

    if (isSuccess) {
      updateOnSuccess();
    }
    if (isError) {
      updateOnError();
    }
  }, [isSuccess, isError, updateOnSuccess, updateOnError]);


  const onClaim = async () => {
    setIsClaimRequest(false);
    toastId.current = loadingNotification("Transaction pending...");
    try {
      setReceipt(await executeContractWrite(
        WriteFunctions.claimFromPools,
        [[poolAddress]],
        chainId,
        writeContractAsync,
        switchChain,
      ) as `0x${string}`);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current, true);
    }
  };

  const completeKeyRequest = async (requestIndex: number, numKeys: number) => {
    const keyIds = poolInfo?.userStakedKeyIds
      .slice(0, numKeys)
      .map((k) => BigInt(k));

    if (!keyIds) {
      throw new Error("Failed to load staked key ids");
    }

    return executeContractWrite(
      WriteFunctions.unstakeKeys,
      [poolAddress, BigInt(requestIndex), keyIds],
      chainId,
      writeContractAsync,
      switchChain,
    );
  };

  const onClaimRequest = async (unstakeRequest: UnstakeRequest) => {
    setIsClaimRequest(true);
    toastId.current = loadingNotification("Transaction pending...");

    try {
      if (unstakeRequest.isKeyRequest) {
        setReceipt(await completeKeyRequest(
          unstakeRequest.index,
          unstakeRequest.amount,
        ) as `0x${string}`);
      } else {
        setReceipt(await executeContractWrite(
          WriteFunctions.unstakeEsXai,
          [
            poolAddress,
            BigInt(unstakeRequest.index),
            BigInt(unstakeRequest.amountWei),
          ],
          chainId,
          writeContractAsync,
          switchChain,
        ) as `0x${string}`);
      }

      setUnstakeRequestIndex(unstakeRequest.index);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current, true);
      return;
    }

  };

  return (
    <>
      {poolInfo && (
        <div className="flex w-full flex-col items-center px-4 lg:px-[75px] xl:px-[150px]">
          <>
            <HeadlineComponent poolInfo={poolInfo} walletAddress={address} isBannedPool={isBannedPool} />
            <div className="mt-2 flex w-full justify-start xl:hidden">
              <ButtonBack btnText={"Back"} onClick={window && window.history.length > 2 ? () => router.back() : () => router.push(`/staking?chainId=${chainId}`)} />
            </div>
            <SummaryDescriptions
              poolInfo={poolInfo}
              onClaim={onClaim}
              chainId={chainId}
              transactionLoading={isLoading}
            />

            {poolInfo && <PoolTierCard poolInfo={poolInfo} tiers={tiers} />}

            <StakingCards
              unstakeRequests={unstakeRequests}
              onClaimRequest={onClaimRequest}
              poolInfo={poolInfo}
              isBannedPool={isBannedPool}
            />
          </>
        </div>
      )}
    </>
  );
};

export default SummaryComponent;
