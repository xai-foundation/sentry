import React from "react";
import { formatCurrencyWithDecimals } from "@/app/utils/formatCurrency";
import { PrimaryButton } from "../ui/buttons";

interface ClaimableRewardsProps {
  totalClaimAmount: number;
  disabled: boolean;
  onClaim: () => void;
  wrapperClasses?: string;
  rewardsText?: string;
  claimAmountClasses?: string;
}

const ClaimableRewardsComponent = ({
  totalClaimAmount,
  disabled,
  onClaim,
  wrapperClasses,
                                     claimAmountClasses,
  rewardsText,
}: ClaimableRewardsProps) => {
  const cuttedRewards = Number(
    totalClaimAmount.toString().match(/^-?\d+(?:\.\d{0,4})?/)
  );
  // cuttedRewards trims totalClaimAmount to 4 digits after point without rounding. example: 1234.56789 -> 1234.5678

  return (
    <div
      className={`flex h-[105px] justify-between bg-gradient-to-b from-[#362E31] to-[#2E2729] global-cta-clip-path items-center sm:pl-[21px] lg:pl-[30px] pr-[21px] ${wrapperClasses}`}
    >
      <div>
        <span className={`mt-1 block md:text-3xl text-2xl font-bold text-white ${claimAmountClasses}`}>
          {formatCurrencyWithDecimals.format(cuttedRewards)} esXAI
        </span>
        <span className="sm:hidden lg:block text-americanSilver text-lg">
          {rewardsText ? rewardsText : "Total claimable rewards"}
        </span>
        <span className="sm:block lg:hidden text-americanSilver text-lg">
          {rewardsText ? rewardsText : "Total rewards"}
        </span>
      </div>
      <PrimaryButton
        onClick={onClaim}
        btnText="CLAIM"
        isDisabled={disabled}
        className="sm:w-[120px] lg:w-[150px] text-[20px]"
        size="md"
        colorStyle="primary"
      />
    </div>
  );
};

export default ClaimableRewardsComponent;
