
import PoolStakingInfo, {
  PoolStakingButtonVariant,
} from "@/app/components/pool/PoolStakingInfo";
import PoolStakingInfoChild from "@/app/components/pool/PoolStakingInfoChild";
import SummaryUnstakingSection from "@/app/components/summary/SummaryUnstakingSection";
import {
  OrderedUnstakeRequests,
  UnstakeRequest,
} from "@/services/web3.service";
import { PoolInfo } from "@/types/Pool";

import { formatCurrencyNoDecimals, formatCurrencyWithDecimals, hideDecimals, showUpToFourDecimals } from "@/app/utils/formatCurrency";
import { WarningIcon } from "@/app/components/icons/IconsComponent";
import { BaseCallout } from "@/app/components/ui";
import React from "react";

interface StakingCardsProps {
  poolInfo: PoolInfo;
  unstakeRequests: OrderedUnstakeRequests;
  onClaimRequest: (unstakeRequest: UnstakeRequest) => object;
  isBannedPool: boolean
}

const StakingCards = ({
  poolInfo,
  unstakeRequests,
  onClaimRequest,
  isBannedPool
}: StakingCardsProps) => {
  const keysProgressValue = +(
    (poolInfo.keyCount / poolInfo.maxKeyCount!) *
    100
  ).toFixed(1);

  const esXAIProgressValue =
    poolInfo.maxStakedAmount == 0
      ? 100
      : +(
        (poolInfo.totalStakedAmount / poolInfo.maxStakedAmount) *
        100
      );

  const formattedUserStakedEsXaiAmount = poolInfo?.userStakedEsXaiAmount
    ? showUpToFourDecimals(formatCurrencyWithDecimals.format(poolInfo.userStakedEsXaiAmount))
    : 0;

  return (
    <div className="flex w-full flex-col gap-7 md:gap-10 mb-4">
      <SummaryUnstakingSection
        onClaimRequest={onClaimRequest}
        unstakeRequests={unstakeRequests}
      />
      <PoolStakingInfo
        infoTitle={"esXAI staking"}
        progressValue={esXAIProgressValue}
        cardTitle={"Your staked esXAI"}
        cardContent={`${formattedUserStakedEsXaiAmount} esXAI`}
        variant={PoolStakingButtonVariant.esXAI}
        canStake={!isBannedPool && ((poolInfo.maxAvailableStake || 0) > 0)}
        canUnstake={(poolInfo.maxAvailableUnstake || 0) > 0}
        poolInfo={poolInfo}
      >
        <div className="flex w-full flex-col">
          {esXAIProgressValue >= 100 &&
            <BaseCallout extraClasses={{ calloutWrapper: "w-full max-w-[900px] mt-4" }} isWarning>
              <div className="w-full flex gap-3">
            <span className="bock h-full md:mt-0 mt-2">
              <WarningIcon />
            </span>
                <span className="block font-medium">
              Pool has exceeded maximum esXAI staking capacity. You may not stake any more esXAI, but you may unstake.
            </span>
              </div>
            </BaseCallout>
          }
          <div className="flex w-full gap-14">
            <PoolStakingInfoChild
              title={"Pool balance"}
              content={`${hideDecimals(formatCurrencyWithDecimals.format(poolInfo.totalStakedAmount))} esXAI`}
            />
            <PoolStakingInfoChild
              title={"Pool capacity"}
              content={`${formatCurrencyNoDecimals.format(poolInfo.maxStakedAmount)} esXAI`}
            />
          </div>
        </div>
      </PoolStakingInfo>

      <PoolStakingInfo
        infoTitle={"Key staking"}
        progressValue={keysProgressValue}
        cardTitle={"Your staked keys"}
        cardContent={`${(poolInfo.userStakedKeyIds.length)} keys`}
        variant={PoolStakingButtonVariant.keys}
        canStake={!isBannedPool && (poolInfo.keyCount < poolInfo.maxKeyCount!)}
        canUnstake={
          poolInfo.userStakedKeyIds.length -
          (poolInfo.unstakeRequestkeyAmount || 0) >
          0
        }
        poolInfo={poolInfo}
      >
        <div className="flex w-full flex-col">
          {keysProgressValue >= 100 && (
            <BaseCallout extraClasses={{ calloutWrapper: "w-full max-w-[900px] mt-4" }} isWarning>
              <div className="w-full flex gap-3">
            <span className="bock h-full md:mt-0 mt-2">
              <WarningIcon />
            </span>
                <span className="block">
                Pool has reached maximum key staking capacity. You may not stake any more keys, but you may unstake.
            </span>
              </div>
            </BaseCallout>
          )}
          <div className="flex w-full gap-14">
            <PoolStakingInfoChild
              title={"Pool balance"}
              content={`${poolInfo.keyCount} keys`}
            />
            <PoolStakingInfoChild
              title={"Pool capacity"}
              content={`${poolInfo.maxKeyCount} keys`}
            />
          </div>
        </div>
      </PoolStakingInfo>
    </div>
  );
};

export default StakingCards;
