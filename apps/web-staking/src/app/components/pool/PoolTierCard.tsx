import React, { useEffect, useState } from "react";

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
import { formatCurrencyWithDecimals, showUpToFourDecimals } from "@/app/utils/formatCurrency";
import { useRouter } from "next/navigation";
import { BaseCallout } from "@/app/components/ui";
import { WarningIcon } from "@/app/components/icons/IconsComponent";
import { useAccount } from "wagmi";

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

  const { chainId } = useAccount();

  const [tierMessage, setTierMessage] = useState("");

  const createTierMessage = async () => {
    if (tier.iconText == "Diamond") {
      return "Pool has reached the final tier!";
    }

    if (poolInfo.totalStakedAmount >= poolInfo.maxStakedAmount) {
      const keysLeft = await calculateKeysToNextTier(poolInfo.totalStakedAmount, poolInfo.keyCount, tier, tiers, chainId);
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

  useEffect(() => {
    createTierMessage().then((message) => setTierMessage(message));
  }, [tierByStaked]);

  return (
    <div className="h-full w-full bg-nulnOil/75 md:px-[24px] px-[18px] py-[21px] md:my-8 my-5 shadow-default">
      <div
        className="flex items-end gap-3 after:content-[''] after:w-full after:h-[1px] after:bg-chromaphobicBlack after:absolute after:left-0 after:top-[70px]">
        <span className="block text-white font-bold md:text-3xl text-2xl">Pool tier</span>
        <ExternalLinkComponent
          content={"Learn more about tiers"}
          externalTab
          link={"https://xai-foundation.gitbook.io/xai-network/xai-blockchain/staking-explained/staking-rewards-and-tiers"}
          customClass="font-semibold !text-lg text-hornetSting"
        />
      </div>
      <div className="mt-8 mb-6 flex w-full items-center gap-6">
        <span>
          {tier.icon && tier.icon({ width: 27, height: 23 })}
        </span>
        <div>
          <span className="text-[40px] text-white leading-none font-bold uppercase">
          {tier.iconText}
        </span>
          <span className="block text-lg font-medium text-elementalGrey">
            {tier.reward} Reward Probability
          </span>
        </div>
      </div>
      {tier.iconText !== "Diamond" && poolInfo.totalStakedAmount >= poolInfo.maxStakedAmount &&
        <BaseCallout extraClasses={{ calloutWrapper: "w-full max-w-[1570px]" }} isWarning>
          <div className="w-full flex gap-3">
            <span className="bock h-full md:mt-0 mt-2">
              <WarningIcon />
            </span>
            <span className="block">
              {tierByStaked.index != tier.index ? "Staked esXAI balance exceeds tier requirements." : "Staked esXAI balance exceeds pool capacity."} Stake
            more keys to increase the pool capacity.
            </span>
          </div>
        </BaseCallout>}
      <div className="mt-4 md:mt-6">
        <ProgressComponent progressValue={progressValue} extraClasses={{ track: "h-[8px]" }} />
        <span className="mt-1 block text-lg font-medium text-elementalGrey">
          {tierMessage}
        </span>
      </div>
    </div>
  );
};

export default PoolTierCard;
