"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import { StakingInput } from "../input/InputComponent";
import MainTitle from "../titles/MainTitle";
import AvailableBalanceComponent from "./AvailableBalanceComponent";
import ReviewStakeComponent from "./ReviewStakeComponent";
import { useGetBalanceHooks, useGetEsXaiAllowance, useGetUserPoolInfo } from "@/app/hooks/hooks";
import { useAccount } from "wagmi";
import { Avatar } from "@nextui-org/react";

interface StakeProps {
  poolAddress: string;
}

const StakeComponent = ({ poolAddress }: StakeProps) => {
  const { address } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams()
  const [reviewVisible, setReviewVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { esXaiBalance } = useGetBalanceHooks();
  const { allowance } = useGetEsXaiAllowance();

  const { userPool } = useGetUserPoolInfo(poolAddress);

  const getMaxEsXaiForUnstake = () => {
    if (!userPool || !userPool.userStakedEsXaiAmount) {
      return 0;
    }
    return userPool.userStakedEsXaiAmount - (userPool.unstakeRequestesXaiAmount || 0);
  }

  const getMaxEsXaiForStake = () => {
    if (!userPool) {
      return 0;
    }
    return Math.min(Math.max(userPool.maxStakedAmount - userPool.totalStakedAmount, 0), esXaiBalance);
  }

  function validationInput() {
    if (
      unstake
        ? Number(inputValue) > getMaxEsXaiForUnstake()
        : Number(inputValue) > getMaxEsXaiForStake()
    ) {
      return true;
    }

    if (inputValue.length > 18) {
      return true;
    }
  }

  const unstake = searchParams.get("unstake") === "true";
  const checkDisabledButton =
    !address || !inputValue || Number(inputValue) <= 0 || validationInput();

  return (
    <div className="flex w-full flex-col items-center sm:p-2 lg:p-0">
      {reviewVisible ? (
        <ReviewStakeComponent
          onBack={() => setReviewVisible(false)}
          title={unstake ? "Unstake esXai" : "Stake esXai"}
          inputValue={inputValue}
          totalStaked={userPool?.userStakedEsXaiAmount}
          maxStake={getMaxEsXaiForStake()}
          unstake={unstake}
          approved={allowance >= Number(inputValue)}
          pool={userPool}
        />
      ) : (
        <div className="flex flex-col items-start">
          <ButtonBack onClick={() => router.back()} btnText="Back" />
          <MainTitle title={unstake ? "Unstake esXai" : "Stake esXai"} />

          {userPool && <div className="flex items-center mb-4">
            <span className="mr-2">{unstake ? 'Unstake from:' : 'Stake to:'}</span>
            <Avatar src={userPool.meta.logo} className="w-[32px] h-[32px] mr-2" />
            <span className="text-graphiteGray">{userPool.meta.name}</span>
          </div>}

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
                availableXaiBalance={unstake ? getMaxEsXaiForUnstake() : getMaxEsXaiForStake()}
                onMaxBtnClick={() =>
                  setInputValue(
                    unstake ? String(getMaxEsXaiForUnstake()) : String(getMaxEsXaiForStake())
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
    </div>
  );
};

export default StakeComponent;
