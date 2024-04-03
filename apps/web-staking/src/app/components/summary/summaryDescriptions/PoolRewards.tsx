import React from "react";

import { PrimaryButton } from "@/app/components/buttons/ButtonsComponent";
import { PoolInfo } from "@/types/Pool";

interface PoolRewardsProps {
  poolInfo: PoolInfo;
  onClaim: () => void;
  transactionLoading: boolean;
  extraClasses?: string;
}

const PoolRewards = ({
  poolInfo,
  onClaim,
  transactionLoading,
  extraClasses,
}: PoolRewardsProps) => {
  return (
    <div
      className={`mb-6 flex h-[80px] w-full max-w-full items-center justify-between rounded-2xl bg-crystalWhite  px-5 py-3  xl:mb-0 xl:max-w-[355px] ${extraClasses}`}
    >
      <div>
        <span className="block">Your rewards</span>
        <span className="block text-2xl font-bold text-lightBlackDarkWhite">
          {poolInfo?.userClaimAmount} esXAI
        </span>
      </div>
      <PrimaryButton
        onClick={onClaim}
        isDisabled={transactionLoading || !poolInfo?.userClaimAmount}
        btnText={"Claim"}
        className="disabled:opacity-50"
      />
    </div>
  );
};

export default PoolRewards;
