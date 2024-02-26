"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import { StakingInput } from "../input/InputComponent";
import MainTitle from "../titles/MainTitle";
import AvailableBalanceComponent from "./AvailableBalanceComponent";
import ReviewStakeComponent from "./ReviewStakeComponent";
import { useGetBalanceHooks, useGetEsXaiAllowance, useGetMaxTotalStakedHooks, useGetTotalStakedHooks } from "@/app/hooks/hooks";

interface StakeProps {
  title: string;
  address: string | undefined;
  unstake?: boolean;
}

const StakeComponent = ({ title, address, unstake }: StakeProps) => {
  const router = useRouter();
  const [reviewVisible, setReviewVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { esXaiBalance } = useGetBalanceHooks();
  const { totalStaked } = useGetTotalStakedHooks();
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

    if (inputValue.length > 18) {
      return true;
    }
  }

  return (
    <>
      {reviewVisible ? (
        <ReviewStakeComponent
          onBack={() => setReviewVisible(false)}
          title={title}
          inputValue={Number(inputValue)}
          totalStaked={totalStaked}
          maxStake={Math.min(totalMaxStaked, esXaiBalance)}
          unstake={unstake}
          approved={allowance >= Number(inputValue)}
        />
      ) : (
        <div className="flex flex-col items-start">
          <ButtonBack onClick={() => router.back()} btnText="Back" />
          <MainTitle title={title} />
          <StakingInput
            value={inputValue}
            label={`${unstake ? 'You unstake' : 'You stake'}`}
            placeholder="0"
            onChange={(e) => setInputValue(e.target.value)}
            isInvalid={validationInput()}
            unstake={unstake}
            endContent={
              <AvailableBalanceComponent
                currency="esXAI"
                availableXaiBalance={unstake ? totalStaked : Math.min(totalMaxStaked, esXaiBalance)}
                onMaxBtnClick={() =>
                  setInputValue(
                    unstake ? String(totalStaked) : String(Math.min(totalMaxStaked, esXaiBalance))
                  )
                }
              />
            }
          />
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
    </>
  );
};

export default StakeComponent;
