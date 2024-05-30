import React from "react";

import { ExternalLinkComponent } from "@/app/components/links/LinkComponent";
import ProgressComponent from "@/app/components/progress/Progress";
import {
  calculateKeysToNextTier,
  getAmountRequiredForUpgrade,
  getCurrentTierByStaking,
  getProgressValue
} from "@/app/components/staking/utils";
import { PoolInfo, TierInfo } from "@/types/Pool";
import { iconType, POOL_DATA_ROWS } from "../dashboard/constants/constants";
import Warning from "@/app/components/summary/Warning";
import { formatCurrencyWithDecimals, showUpToFourDecimals } from "@/app/utils/formatCurrency";

interface PoolTierCardProps {
  poolInfo: PoolInfo;
  tiers: Array<TierInfo & { icon?: iconType }>;
}

const PoolTierCard = ({ poolInfo, tiers }: PoolTierCardProps) => {

  const tierByStaked = getCurrentTierByStaking(poolInfo.totalStakedAmount, tiers) as TierInfo & {
    icon: iconType
  };

  const tier = getCurrentTierByStaking(Math.min(poolInfo.totalStakedAmount, poolInfo.maxStakedAmount), tiers) as TierInfo & {
    icon: iconType
  };

  const progressValue = getProgressValue(
    poolInfo.totalStakedAmount,
    tiers,
    tier
  );

  const amountToUpgrade = getAmountRequiredForUpgrade(
    poolInfo.totalStakedAmount,
    tiers,
    tier
  );

  const createTierMessage = () => {
    if (tier.iconText == "Diamond") {
      return "Pool has reached the final tier!";
    }

    if (poolInfo.totalStakedAmount >= poolInfo.maxStakedAmount) {
      const keysLeft = calculateKeysToNextTier(poolInfo.totalStakedAmount, poolInfo.keyCount, tier, tiers);
      if (tierByStaked.index !== tier.index) {
        return `Stake ${keysLeft} more ${keysLeft > 1 ? `keys` : `key`} to reach ${POOL_DATA_ROWS[tierByStaked.index - 1].nextTierName}`;
      }
      return `Stake more keys for higher esXAI staking capacity.`;
    }

    if (amountToUpgrade > 0) {
      return `Stake ${showUpToFourDecimals(formatCurrencyWithDecimals.format(amountToUpgrade))} more esXAI to reach the next tier.`;
    }

    return "Maximum esXAI capacity reached, stake more keys.";
  };

  return (
    <div className="my-5 h-full w-full rounded-2xl border-1 px-[24px] py-[21px] shadow-md md:my-16">
      <div className="flex w-full justify-between">
        <span className="block text-graphiteGray">Current tier</span>
        <ExternalLinkComponent
          externalTab
          link="https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-nodes-explained/accruing-node-rewards"
          content={"Learn more"}
          customClass="font-medium"
        />
      </div>
      <div className="mt-1 flex w-full items-center">
        <span className="mr-2">
          {tier.icon && tier.icon({ width: 27, height: 23 })}
        </span>
        <span className="text-[32px] text-lightBlackDarkWhite">
          {tier.iconText}
        </span>
      </div>
      {tier.iconText !== "Diamond" && poolInfo.totalStakedAmount >= poolInfo.maxStakedAmount && <div>
            <Warning
              warning={`${tierByStaked.index != tier.index ? "Staked esXAI balance exceeds tier requirements." : "Staked esXAI balance exceeds pool capacity."} Stake more keys to increase the pool capacity.`} />
          </div>}
      <div className="mt-4 md:mt-8">
        <ProgressComponent progressValue={progressValue} />
        <span className="mt-1 block text-base lg:text-lg">
          {createTierMessage()}
        </span>
      </div>
    </div>
  );
};

export default PoolTierCard;
