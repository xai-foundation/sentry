"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";

import PoolTierCard from "@/app/components/pool/PoolTierCard";
import HeadlineComponent from "@/app/components/summary/HeadlineComponent";
import StakingCards from "@/app/components/summary/StakingCards";
import SummaryDescriptions from "@/app/components/summary/summaryDescriptions/SummaryDescriptions";
import { useGetUnstakeRequests, useGetUserPoolInfo } from "@/app/hooks/hooks";
import { sendUpdatePoolRequest } from "@/services/requestService";
import {
  UnstakeRequest,
  getWeiAmount,
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

const SummaryComponent = () => {
  const router = useRouter();
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [refreshPoolInfo, setRefreshPoolInfo] = useState(false);
  const [refreshUnstakeRequests, setRefreshUnstakeRequests] = useState(false);
  // const [poolInfo, setData] = useState<PoolInfo>();

  const { address, chainId } = useAccount();
  const { poolAddress } = useParams<{ poolAddress: string }>();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { unstakeRequests } = useGetUnstakeRequests(
    poolAddress,
    refreshUnstakeRequests,
  );

  const { userPool: poolInfo } = useGetUserPoolInfo(
    poolAddress,
    refreshPoolInfo,
  );

  const onClaim = async () => {
    setTransactionLoading(true);
    const loading = loadingNotification("Transaction pending...");
    try {
      const receipt = await executeContractWrite(
        WriteFunctions.claimFromPools,
        [[poolAddress]],
        chainId,
        writeContractAsync,
        switchChain,
      );

      setTimeout(async () => {
        updateNotification(
          "Successfully claimed",
          loading,
          false,
          receipt,
          chainId,
        );
        setRefreshPoolInfo(!refreshPoolInfo);
        setTransactionLoading(false);
      }, 3000);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
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
    const loading = loadingNotification("Transaction pending...");
    setTransactionLoading(true);
    let receipt: string;

    try {
      if (unstakeRequest.isKeyRequest) {
        receipt = await completeKeyRequest(
          unstakeRequest.index,
          unstakeRequest.amount,
        );
      } else {
        receipt = await executeContractWrite(
          WriteFunctions.unstakeEsXai,
          [
            poolAddress,
            BigInt(unstakeRequest.index),
            BigInt(getWeiAmount(unstakeRequest.amount)),
          ],
          chainId,
          writeContractAsync,
          switchChain,
        );
      }
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
      return;
    }

    setTimeout(async () => {
      updateNotification(
        "Successfully claimed",
        loading,
        false,
        receipt,
        chainId,
      );

      sendUpdatePoolRequest(poolAddress, chainId);
      setRefreshPoolInfo(!refreshPoolInfo);
      updateRequestClaimed(
        getNetwork(chainId),
        address!,
        poolAddress,
        unstakeRequest.index,
      );
      setRefreshUnstakeRequests(!refreshUnstakeRequests);
      setTransactionLoading(false);
    }, 3000);
  };

  return (
    <>
      {poolInfo && (
        <div className="flex w-full flex-col items-center px-4 lg:px-[75px] xl:px-[150px]">
          <>
            <HeadlineComponent poolInfo={poolInfo} walletAddress={address} />
            <div className="mt-2 flex w-full justify-start xl:hidden">
              <ButtonBack btnText={"Back"} onClick={() => router.back()} />
            </div>
            <SummaryDescriptions
              poolInfo={poolInfo}
              onClaim={onClaim}
              transactionLoading={transactionLoading}
            />

            {poolInfo?.tier && <PoolTierCard poolInfo={poolInfo} />}

            <StakingCards
              unstakeRequests={unstakeRequests}
              onClaimRequest={onClaimRequest}
              poolInfo={poolInfo}
            />
          </>
        </div>
      )}
    </>
  );
};

export default SummaryComponent;
