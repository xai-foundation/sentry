
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

import Warning from "./Warning";
import { formatCurrencyNoDecimals, formatCurrencyWithDecimals, hideDecimals } from "@/app/utils/formatCurrency";

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
    (poolInfo.keyCount / poolInfo.maxKeyCount) *
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
    ? formatCurrencyWithDecimals.format(poolInfo.userStakedEsXaiAmount)
    : 0;

  return (
    <div className="mt-4 flex w-full flex-col gap-7 md:gap-14">
      <SummaryUnstakingSection
        onClaimRequest={onClaimRequest}
        unstakeRequests={unstakeRequests}
      />
      <PoolStakingInfo
        infoTitle={"esXAI staking"}
        progressValue={esXAIProgressValue}
        poolAddress={poolInfo?.address}
        cardTitle={"Your staked esXAI"}
        cardContent={`${formattedUserStakedEsXaiAmount} esXAI`}
        variant={PoolStakingButtonVariant.esXAI}
        canStake={!isBannedPool && ((poolInfo.maxAvailableStake || 0) > 0)}
        canUnstake={(poolInfo.maxAvailableUnstake || 0) > 0}
      >
        <div className="flex w-full flex-col gap-5">
          {esXAIProgressValue >= 100 && (
            <Warning
              warning={
                "Pool has exceeded maximum esXAI staking capacity. You may not stake any more esXAI, but you may unstake."
              }
            />
          )}
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
        poolAddress={poolInfo?.address}
        progressValue={keysProgressValue}
        cardTitle={"Your staked keys"}
        cardContent={`${(poolInfo.userStakedKeyIds.length)} keys`}
        variant={PoolStakingButtonVariant.keys}
        canStake={!isBannedPool && (poolInfo.keyCount < poolInfo.maxKeyCount)}
        canUnstake={
          poolInfo.userStakedKeyIds.length -
          (poolInfo.unstakeRequestkeyAmount || 0) >
          0
        }
      >
        <div className="flex w-full flex-col gap-5">
          {keysProgressValue >= 100 && (
            <Warning
              warning={
                "Pool has reached maximum key staking capacity. You may not stake any more keys, but you may unstake."
              }
            />
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
