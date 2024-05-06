import { PrimaryButton } from "../buttons/ButtonsComponent";
import React from "react";
import { formatCurrencyWithDecimals } from "@/app/utils/formatCurrency";

interface ClaimableRewardsProps {
  totalClaimAmount: number,
  disabled: boolean,
  onClaim: () => void
  wrapperClasses?: string;
  rewardsText?: string;
}

const ClaimableRewardsComponent = ({
  totalClaimAmount,
  disabled,
  onClaim,
  wrapperClasses,
  rewardsText
}: ClaimableRewardsProps) => {
  const cuttedRewards = Number(totalClaimAmount.toString().match(/^-?\d+(?:\.\d{0,2})?/));
  // cuttedRewards trims totalClaimAmount to 2 digits after point without rounding. example: 1234.56789 -> 1234.56

  return (
    <div
      className={`flex h-[95px] w-full max-w-full items-center justify-between rounded-2xl bg-crystalWhite px-[21px] xl:max-w-[398px] ${wrapperClasses}`}>
      <div>
        <span className="block text-graphiteGray">
          {rewardsText ? rewardsText : "Total claimable rewards"}
        </span>
        <span className="mt-1 block text-2xl font-medium">
          {formatCurrencyWithDecimals.format(cuttedRewards)} esXAI
        </span>
      </div>
      <PrimaryButton
        onClick={onClaim}
        btnText="Claim"
        isDisabled={disabled}
        className="h-[48px] w-full max-w-[105px] disabled:opacity-50"
      />
    </div>
  );
};

export default ClaimableRewardsComponent;
