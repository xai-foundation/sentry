"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import { StakingInput } from "../input/InputComponent";
import MainTitle from "../titles/MainTitle";
import AvailableBalanceComponent from "./AvailableBalanceComponent";
import ReviewStakeComponent from "./ReviewStakeComponent";
import CurrencyStakeComponent from "./CurrencyStakeComponent";
import { useGetBalanceHooks, useGetEsXaiAllowance, useGetMaxTotalStakedHooks, useGetTotalStakedHooks } from "@/app/hooks/hooks";
import { useAccount } from "wagmi";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import { getWeiAmountFromTextInput } from "@/services/web3.service";

interface StakeProps {
  title: string;
  unstake?: boolean;
}

const StakeV1Component = ({ title, unstake }: StakeProps) => {
  const { address } = useAccount();
  const router = useRouter();
  const [reviewVisible, setReviewVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputValueWei, setInputValueWei] = useState("");
  const { esXaiBalance } = useGetBalanceHooks();
  const { totalStaked, totalStakedWei } = useGetTotalStakedHooks();
  const { totalMaxStaked } = useGetMaxTotalStakedHooks();
  const { allowance } = useGetEsXaiAllowance();

  const checkDisabledButton =
    !address || !inputValue || Number(inputValue) <= 0 || validationInput();

  function validationInput() {
    if (
      unstake
        ? Number(inputValue) > totalStaked
        : Number(inputValue) > Math.min(totalMaxStaked, esXaiBalance)
    ) {
      return true;
    }
  }

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {

    e.preventDefault();

    const value = e.target.value;
    if (value.length > 16) {
      return;
    }

    setInputValue(e.target.value);
    setInputValueWei(getWeiAmountFromTextInput(e.target.value));
  }


  return (
    <div className="flex w-full flex-col items-center sm:p-2 lg:p-0">
      {reviewVisible ? (
        <ReviewStakeComponent
          onBack={() => setReviewVisible(false)}
          title={title}
          displayValue={inputValue}
          inputValueWei={inputValueWei}
          totalStaked={totalStaked}
          unstake={unstake}
          approved={unstake ? true : allowance >= Number(inputValue)}
        />
      ) : (
        <div className="flex flex-col items-start">
          <ButtonBack onClick={() => router.back()} btnText="Back" />
          <MainTitle title={title} />
          <BorderWrapperComponent>
            <StakingInput
              value={inputValue}
              label={`${unstake ? "You unstake" : "You stake"}`}
              placeholder="0"
              onChange={onChangeInput}
              isInvalid={validationInput()}
              unstake={unstake}
              endContent={<CurrencyStakeComponent currency="esXAI" />}
            />
            <AvailableBalanceComponent
              availableXaiBalance={
                unstake ? totalStaked : Math.min(totalMaxStaked, esXaiBalance)
              }
              onMaxBtnClick={() => {
                setInputValue(
                  unstake
                    ? String(totalStaked)
                    : "0"
                )
                setInputValueWei(
                  unstake
                    ? totalStakedWei
                    : "0"
                )
              }}
            />
          </BorderWrapperComponent>
          <PrimaryButton
            onClick={() => {
              setReviewVisible(true);
            }}
            btnText="Continue"
            className="w-full disabled:opacity-50"
            isDisabled={checkDisabledButton}
          />
        </div>
      )}
    </div>
  );
};

export default StakeV1Component;
