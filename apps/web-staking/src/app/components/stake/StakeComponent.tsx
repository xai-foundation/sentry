"use client";

import { ChangeEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import { StakingInput } from "../input/InputComponent";
import MainTitle from "../titles/MainTitle";
import AvailableBalanceComponent from "./AvailableBalanceComponent";
import ReviewStakeComponent from "./ReviewStakeComponent";
import { useGetBalanceHooks, useGetEsXaiAllowance, useGetUserPoolInfo } from "@/app/hooks/hooks";
import { useAccount } from "wagmi";
import { Avatar } from "@nextui-org/react";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import CurrencyStakeComponent from "./CurrencyStakeComponent";
import { getWeiAmountFromTextInput } from "@/services/web3.service";

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

  return (
    <div className="flex w-full flex-col items-center sm:p-2 lg:p-0">

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
          <ButtonBack onClick={() => router.back()} btnText="Back" />
          <MainTitle title={unstake ? "Unstake esXAI" : "Stake esXAI"} />

          {userPool && <div className="flex items-center mb-4">
            <span className="mr-2">{unstake ? 'Unstake from:' : 'Stake to:'}</span>
            <Avatar src={userPool.meta.logo} className="w-[32px] h-[32px] mr-2" />
            <span className="text-graphiteGray">{userPool.meta.name}</span>
          </div>}

          <BorderWrapperComponent>
            <StakingInput
              value={displayedInput}
              label={`${unstake ? "You unstake" : "You stake"}`}
              placeholder="0"
              onChange={onChangeInput}
              isInvalid={isInvalidInput()}
              unstake={unstake}
              endContent={<CurrencyStakeComponent currency="esXAI" />}
            />
            <AvailableBalanceComponent
              availableXaiBalance={
                unstake
                  ? avoidScientificNotation(getMaxEsXaiForUnstake(), true)
                  : avoidScientificNotation(getMaxEsXaiForStake(), true)
              }
              onMaxBtnClick={onButtonMax}
            />
          </BorderWrapperComponent>
          <PrimaryButton
            onClick={() => {
              setReviewVisible(true);
            }}
            btnText="Continue"
            className="w-full disabled:opacity-50"
            isDisabled={confirmButtonDisabled()}
          />
        </div>
      )}
    </div>
  );
};

export default StakeComponent;
