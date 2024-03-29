"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";

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
  useGetUserTotalStakedKeysCount,
} from "@/app/hooks/hooks";
import { getNetwork, getTotalClaimAmount, mapWeb3Error } from "@/services/web3.service";
import { executeContractWrite, WriteFunctions } from "@/services/web3.writes";

import AgreeModalComponent from "../modal/AgreeModalComponents";
import MainTitle from "../titles/MainTitle";

export const DashboardComponent = () => {
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
  const [rewardsTransactionLoading, setRewardsTransactionLoading] =
    useState(false);
  const [currentTotalClaimableAmount, setCurrentTotalClaimableAmount] = useState<number>();
  const { unstakedKeyCount } = useGetUnstakedNodeLicenseCount();

  const onClaimRewards = async () => {
    if (isLoading || rewardsTransactionLoading) {
      return;
    }

    const poolsToClaim = userPools.filter(p => p.userClaimAmount && p.userClaimAmount > 0).map(p => p.address);

    setRewardsTransactionLoading(true);
    const loading = loadingNotification("Transaction pending...");
    try {

      const receipt = await executeContractWrite(
        WriteFunctions.claimFromPools,
        [poolsToClaim.slice(0, 10)], //TODO test if this works for more than 10 pools in 1 transaction
        chainId,
        writeContractAsync,
        switchChain
      );

      setTimeout(async () => {
        updateNotification(
          "Successfully claimed",
          loading,
          false,
          receipt,
          chainId
        );

        getTotalClaimAmount(getNetwork(chainId), userPools.map(p => p.address), address!)
          .then(totalClaim => {
            setRewardsTransactionLoading(false);
            setCurrentTotalClaimableAmount(totalClaim);
          });

      }, 3000);

      setTimeout(async () => {
        window.location.reload();
      }, 6000);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setRewardsTransactionLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <AgreeModalComponent address={address} />
      <div className="flex w-full max-w-[928px] flex-col items-start px-5 xl:px-0">
        <MainTitle title={"Dashboard"} />
      </div>
      {address && (!totalStaked || !stakedKeysAmount) && <DashboardPromo chainId={chainId} />}
      <div className="mt-[10px] flex w-full max-w-[928px] flex-col items-start px-5 xl:px-0">
        {address && (
          <div className="flex w-full flex-col md:flex-row md:justify-between">
            <h3 className="text-lg font-bold md:mb-4">Available balance</h3>
            <div className="self-end md:self-start">
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
            totalClaimableAmount={currentTotalClaimableAmount || totalClaimableAmount}
            rewardsTransactionLoading={rewardsTransactionLoading}
          />
        )}
      </div>
    </div>
  );
};
