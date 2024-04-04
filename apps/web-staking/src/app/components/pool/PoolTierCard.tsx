import React from "react";

import { ExternalLinkComponent } from "@/app/components/links/LinkComponent";
import ProgressComponent from "@/app/components/progress/Progress";
import {
  getAmountRequiredForUpgrade,
  getCurrentTierByStaking,
  getProgressValue,
} from "@/app/components/staking/utils";
import { PoolInfo, TierInfo } from "@/types/Pool";
import { iconType } from "../dashboard/constants/constants";

interface PoolTierCardProps {
  poolInfo: PoolInfo;
}


const PoolTierCard = ({ poolInfo }: PoolTierCardProps) => {
  const progressValue = getProgressValue(
    poolInfo.totalStakedAmount,
    poolInfo.tier,
  );

  const amountToUpgrade = getAmountRequiredForUpgrade(
    poolInfo.totalStakedAmount,
    poolInfo.tier,
  );

  const createTierMessage = () => {
    if (poolInfo?.tier?.iconText == 'Diamond') {
      return 'Pool has reached the final tier!';
    }

    if (amountToUpgrade >= 0) {
      return `Stake ${amountToUpgrade} more esXAI to reach the next tier.`;
    }

    return 'Maximum esXAI capacity reached, stake more keys.';
  }

  const tier = getCurrentTierByStaking(Math.min(poolInfo.totalStakedAmount, poolInfo.maxStakedAmount)) as TierInfo & { icon: iconType }

  return (
    <div className="my-5 h-[194px] w-full rounded-2xl border-1 px-[24px] py-[21px] shadow-md md:my-16">
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
          {tier?.icon && tier?.icon({ width: 27, height: 23 })}
        </span>
        <span className="text-[32px] text-lightBlackDarkWhite">
          {poolInfo?.tier?.iconText}
        </span>
      </div>
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
