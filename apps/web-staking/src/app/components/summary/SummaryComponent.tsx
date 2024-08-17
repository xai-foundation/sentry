"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import PoolTierCard from "@/app/components/pool/PoolTierCard";
import HeadlineComponent from "@/app/components/summary/HeadlineComponent";
import StakingCards from "@/app/components/summary/StakingCards";
import SummaryDescriptions from "@/app/components/summary/summaryDescriptions/SummaryDescriptions";
import { useGetUnstakeRequests, useGetUserPoolInfo } from "@/app/hooks";
import {
  UnstakeRequest,
  mapWeb3Error,
  updateRequestClaimed,
  getNetwork,
} from "@/services/web3.service";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";

import {
  loadingNotification,
  updateNotification,
} from "../notifications/NotificationsComponent";
import { Id } from "react-toastify";
import { useGetTiers } from "@/app/hooks/useGetTiers";
import { ButtonBack } from "@/app/components/ui/buttons";
import { PoolInfo } from "@/types/Pool";

const SummaryComponent = ({ isBannedPool, poolFromDb }: { isBannedPool: boolean, poolFromDb?: PoolInfo }) => {
  const router = useRouter();
  const activePage = sessionStorage.getItem("activePage");
  const [refreshPoolInfo, setRefreshPoolInfo] = useState(false);
  const [refreshUnstakeRequests, setRefreshUnstakeRequests] = useState(false);
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
    
    setUnstakeRequestIndex(unstakeRequest.index);

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

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current, true);
      return;
    }

  };

  return (
    <>
      {poolInfo && (
        <div className="flex w-full flex-col items-center lg:px-[35px] lg:pb-[50px] xl:pr-[56px] px-0 sm:pb-[70px]">
          <>
            <div className="mt-2 flex w-full justify-start lg:z-40">
              <ButtonBack
                btnText={`Back to ${activePage === "/pool" ? "my pools" : "staking"}`}
                fill="#FF2C3A"
                onClick={activePage === "/pool" ? () => router.push(`/pool`) : () => router.push(`/staking?chainId=${chainId}`)}
                extraClasses="uppercase text-white text-lg font-bold lg:mb-8 mb-4 lg:mx-0 mx-[17px]"
              />
            </div>
            <HeadlineComponent
              poolInfo={poolInfo}
              walletAddress={address}
              isBannedPool={isBannedPool}
              ownerLatestUnstakeRequestCompletionTime={(poolFromDb ? (poolFromDb.ownerLatestUnstakeRequestCompletionTime || 0) : 0)}
            />
            <SummaryDescriptions
              poolInfo={poolInfo}
              onClaim={onClaim}
              chainId={chainId}
              transactionLoading={isLoading}
              address={address}
            />

            {poolInfo && tiers && <PoolTierCard poolInfo={poolInfo} tiers={tiers} />}

            <StakingCards
              unstakeRequests={unstakeRequests}
              onClaimRequest={onClaimRequest}
              poolInfo={poolInfo}
              poolFromDb={poolFromDb}
              isBannedPool={isBannedPool}
            />
          </>
        </div>
      )}
    </>
  );
};

export default SummaryComponent;
