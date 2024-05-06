"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { ExternalLinkComponent } from "@/app/components/links/LinkComponent";
import {
  loadingNotification,
  updateNotification,
} from "@/app/components/notifications/NotificationsComponent";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import DashboardPromo from "@/app/components/dashboard/DashboardPromo";
import DashboardStakingInfo from "@/app/components/dashboard/DashboardStakingInfo";
import {
  useGetBalanceHooks,
  useGetUnstakedNodeLicenseCount,
  useGetUserInteractedPools,
  useGetUserTotalStakedKeysCount
} from "@/app/hooks/hooks";
import { getNetwork, getTotalClaimAmount, mapWeb3Error } from "@/services/web3.service";
import { executeContractWrite, WriteFunctions } from "@/services/web3.writes";

import AgreeModalComponent from "../modal/AgreeModalComponents";
import MainTitle from "../titles/MainTitle";
import { Id } from "react-toastify";
import NetworkStats from "@/app/components/dashboard/NetworkStats";
import { INetworkData } from "@/server/services/Pool.service";


interface IDashboardProps {
  networkData: INetworkData;
}

export const DashboardComponent = ({
  networkData
}: IDashboardProps) => {
  const { xaiBalance, esXaiBalance } = useGetBalanceHooks();
  const { totalClaimableAmount, userPools, isLoading } = useGetUserInteractedPools();
  const totalStaked = userPools.reduce((acc, pool) => {
    if (pool?.userStakedEsXaiAmount) return (acc += pool.userStakedEsXaiAmount);
    return acc;
  }, 0);
  const { stakedKeysAmount } = useGetUserTotalStakedKeysCount();
  const { chainId, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const [currentTotalClaimableAmount, setCurrentTotalClaimableAmount] = useState<number>(0);
  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
  const router = useRouter();
  const { unstakedKeyCount } = useGetUnstakedNodeLicenseCount();

  // Substitute Timeouts with useWaitForTransaction
  const { data, isError, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
  });

  const toastId = useRef<Id>();

  const onClaimRewards = async () => {
    if (isLoading) {
      return;
    }

    const poolsToClaim = userPools.filter(p => p.userClaimAmount && p.userClaimAmount > 0).map(p => p.address);

    toastId.current = loadingNotification("Transaction pending...");
    try {

      setReceipt(await executeContractWrite(
        WriteFunctions.claimFromPools,
        [poolsToClaim.slice(0, 10)], //TODO test if this works for more than 10 pools in 1 transaction
        chainId,
        writeContractAsync,
        switchChain
      ) as `0x${string}`);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current as Id, true);
    }
  };

  const updateOnSuccess = useCallback(() => {
    updateNotification(`Successfully claimed`, toastId.current as Id, false, receipt, chainId);
    getTotalClaimAmount(getNetwork(chainId), userPools.map(p => p.address), address!)
      .then(totalClaim => {
        setCurrentTotalClaimableAmount(totalClaim);
      });
    router.refresh();
  }, [address, receipt, chainId, userPools, router])

  const updateOnError = useCallback(() => {
    const error = mapWeb3Error(status);
    updateNotification(error, toastId.current as Id, true);
  }, [status])

  useEffect(() => {

    if (isSuccess) {
      updateOnSuccess();
    }
    if (isError) {
      updateOnError();
    }
  }, [isSuccess, isError, updateOnSuccess, updateOnError]);

  useEffect(() => {
    setCurrentTotalClaimableAmount(totalClaimableAmount)
  }, [totalClaimableAmount])


  return (
    <div className="flex w-full flex-col items-center">
      <AgreeModalComponent address={address} />
      <div className="flex w-full max-w-[928px] flex-col items-start px-5 xl:px-0">
        <MainTitle title={"Dashboard"} />
      </div>
      <NetworkStats
        networkData={networkData}
      />
      {address && !isLoading && (!totalStaked || !stakedKeysAmount) && <DashboardPromo chainId={chainId} />}
      <div className="mt-10 flex w-full max-w-[928px] flex-col items-start px-5 xl:px-0">
        {address && (
          <div className="flex w-full flex-col md:flex-row md:justify-between">
            <h3 className="text-lg font-bold md:mb-4">Available balance</h3>
            <div className="self-end md:self-start mb-[10px] md:mb-0">
              <ExternalLinkComponent
                link={"https://sentry.xai.games/"}
                content={"Buy keys"}
                customClass="mr-4 !text-base"
                externalTab
              />
              <ExternalLinkComponent
                link={
                  "https://www.binance.com/en/trade/XAI_USDT?_from=markets&type=spot"
                }
                content={"Buy XAI"}
                customClass="mr-4 !text-base"
                externalTab
              />
              <ExternalLinkComponent
                link={"/redeem"}
                content={"Redeem"}
                customClass="!text-base"
              />
            </div>
          </div>
        )}

        <DashboardCard
          esXaiBalance={esXaiBalance}
          xaiBalance={xaiBalance}
          address={address}
          unstakedKeyCount={unstakedKeyCount}
        />
        {address && (
          <DashboardStakingInfo
            totalStaked={totalStaked}
            onClaimRewards={onClaimRewards}
            totalClaimableAmount={currentTotalClaimableAmount}
            rewardsTransactionLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};