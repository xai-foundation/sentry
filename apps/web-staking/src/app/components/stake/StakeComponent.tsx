"use client";

import React, { ChangeEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainTitle from "../titles/MainTitle";
import ReviewStakeComponent from "./ReviewStakeComponent";
import { useGetEsXaiAllowance, useGetMaxStakePerLicense, useGetUserPoolInfo } from "@/app/hooks/hooks";
import { useAccount } from "wagmi";
import { Avatar } from "@nextui-org/react";
import { getWeiAmountFromTextInput } from "@/services/web3.service";
import { ButtonBack, PrimaryButton } from "@/app/components/ui/buttons";
import { StakingInput, Tooltip } from "@/app/components/ui";
import { CURRENCY } from "@/app/components/redeem/Constants";
import { HelpIcon } from "@/app/components/icons/IconsComponent";

interface StakeProps {
  poolAddress: string;
  isBannedPool: boolean;
}

const StakeComponent = ({ poolAddress, isBannedPool }: StakeProps) => {
  const { address } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams()
  const [reviewVisible, setReviewVisible] = useState(false);
  const [displayedInput, setDisplayedInput] = useState("");
  const [inputValueWei, setInputValueWei] = useState("");
  const { allowance } = useGetEsXaiAllowance();
  const { maxStakePerKey } = useGetMaxStakePerLicense();
  const unstake = searchParams.get("unstake") === "true";

  const { userPool } = useGetUserPoolInfo(poolAddress);

  const getMaxEsXaiForUnstake = () => {
    if (!userPool || !userPool.userStakedEsXaiAmount) {
      return 0;
    }
    return userPool.maxAvailableUnstake || 0;
  }

  const getMaxEsXaiForStake = () => {
    if (!userPool) {
      return 0;
    }
    return userPool.maxAvailableStake || 0;
  }

  function isInvalidInput() {
    if (unstake) {
      return Number(displayedInput) > getMaxEsXaiForUnstake();
    }

    return Number(displayedInput) > getMaxEsXaiForStake();
  }

  const confirmButtonDisabled = () => {
    return !address || !displayedInput || Number(displayedInput) <= 0 || isInvalidInput() || (isBannedPool && !unstake)
  }

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {

    e.preventDefault();

    const value = e.target.value;
    if (value.length > 16) {
      return;
    }

    setDisplayedInput(e.target.value);
    setInputValueWei(getWeiAmountFromTextInput(e.target.value));
  }

  const onButtonMax = () => {
    let displayAmount = String(avoidScientificNotation(getMaxEsXaiForStake()));
    let weiAmount = userPool?.maxAvailableStakeWei || BigInt(0);
    if (unstake) {
      displayAmount = String(avoidScientificNotation(getMaxEsXaiForUnstake()));
      weiAmount = userPool?.maxAvailableUnstakeWei || BigInt(0);
    }

    setInputValueWei(weiAmount.toString());
    setDisplayedInput(displayAmount.substring(0, 17));
  }

  const avoidScientificNotation = (baseValue: number, isStatic?: boolean) => {
    if (baseValue == 0) {
      return "0"
    }

    if (baseValue < 0.001 && isStatic) {
      return "<0,001";
    }

    if (baseValue && baseValue < 0.000001) {
      let transformValue = '';
      const valueArr = Number(baseValue).toFixed(18).split("");
      const lastNumIndex = valueArr.findLastIndex((element) => Number(element) > 0);
      transformValue = Number(baseValue).toFixed(lastNumIndex === -1 ? 0 : lastNumIndex - 1);
      return transformValue;
    }

    return baseValue
  }

  const displayAvailableBalance = (value: string | number) => {
    if (typeof value === "string") {
      // string we got when we returned <0.0001 or 0 because we always have isStatic flag as true
      return value;
    }
    // cutting (not rounding) to 4 digits after point (just for displaying, not for functionality)
    return value.toString().match(/^-?\d+(?:\.\d{0,4})?/);
  };

  return (
    <div className="flex w-full flex-col items-center lg:p-0 xl:ml-[-122px] lg:ml-[-61px]">

      {reviewVisible ? (
        <ReviewStakeComponent
          onBack={() => setReviewVisible(false)}
          title={unstake ? "Unstake esXAI" : "Stake esXAI"}
          displayValue={displayedInput}
          inputValueWei={inputValueWei}
          totalStaked={userPool?.userStakedEsXaiAmount}
          unstake={unstake}
          approved={unstake ? true : allowance >= Number(displayedInput)}
          pool={userPool}
        />
      ) : (
        <div className="flex flex-col items-start">
          <ButtonBack
            onClick={() => router.back()}
            btnText={`Back to pool`}
            extraClasses="md:ml-0 ml-[15px]"
          />
          <MainTitle title={unstake ? "UNSTAKE esXAI" : "STAKE esXAI"}
                     classNames="md:ml-0 ml-[17px] mt-[18px] normal-case	" />

          <div className="shadow-default">
            <div className="bg-nulnOil/75 py-[40px] md:px-[25px] px-[17px] ">
              {userPool && <div className="flex items-center mb-4">
              <span
                className="mr-5 text-lg font-medium text-americanSilver text-nowrap">{unstake ? "Unstaking from:" : "Staking to:"}</span>
                <Avatar src={userPool.meta.logo} className="w-[32px] h-[32px] mr-2" />
                <span className="text-white text-lg font-bold">{userPool.meta.name}</span>
              </div>}


              <div className="relative">
                <StakingInput
                  value={displayedInput}
                  label={`${unstake ? "You unstake" : "You stake"}`}
                  onChange={onChangeInput}
                  extraClasses={{ calloutWrapper: "h-[160px]", input: "placeholder:!text-foggyLondon" }}
                  error={isInvalidInput() ? { message: "Not enough XAI" } : {}}
                  currencyLabel={CURRENCY.ES_XAI}
                  withIcon
                  withTooltip
                  handleMaxValue={onButtonMax}
                  availableBalance={unstake
                    ? displayAvailableBalance(avoidScientificNotation(getMaxEsXaiForUnstake(), true))
                    : displayAvailableBalance(avoidScientificNotation(getMaxEsXaiForStake(), true))}
                />
                <span
                  className="mt-1 absolute md:right-[58px] md:bottom-[27px] right-[62px] bottom-[35px]">
                <Tooltip
                  extraClasses={{ tooltipContainer: "lg:left-auto lg:!right-[-38px] xl:left-[-38px] left-[-38px]" }}
                  content={"Your staking capacity is dependent on how many keys you own. Each key will increase your staking capacity by ##MAXSTAKE## esXAI".replace("##MAXSTAKE##", maxStakePerKey.toString())}>
                <HelpIcon
                  height={14}
                  width={14}
                />
              </Tooltip>
              </span>

              </div>
            </div>
            <PrimaryButton
              onClick={() => {
                setReviewVisible(true);
              }}
              btnText="Continue"
              className="w-full disabled:opacity-50 uppercase !font-bold !text-xl "
              wrapperClassName="w-full"
              isDisabled={confirmButtonDisabled()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeComponent;
