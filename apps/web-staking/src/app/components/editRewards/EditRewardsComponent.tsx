'use client';

import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ButtonBack,
} from "../buttons/ButtonsComponent";
import { useRouter } from "next/navigation";
import { WarningIcon } from "../icons/IconsComponent";
import RewardComponent from "../createPool/RewardComponent";
import MainTitle from "../titles/MainTitle";
import { useGetPoolInfoHooks, useGetRewardBreakdownUpdateDelay } from "@/app/hooks/hooks";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  loadingNotification,
  updateNotification,
} from "../notifications/NotificationsComponent";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { POOL_SHARES_BASE, mapWeb3Error } from "@/services/web3.service";
import { Id } from "react-toastify";
import { BaseCallout, PrimaryButton } from "../ui";

const EditRewardsComponent = () => {
  const { rewardsValues, setRewardsValues, isLoading, poolAddress } = useGetPoolInfoHooks();
  const { rewardBreakdownDelay } = useGetRewardBreakdownUpdateDelay()
  const [errorValidationRewards, setErrorValidationRewards] = useState(false);
  const router = useRouter();
  const { chainId } = useAccount();
  moment.relativeTimeThreshold("d", 1000);

  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();

  // Substitute Timeouts with useWaitForTransaction
  const { isError, isLoading: transactionLoading, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
  });

  const toastId = useRef<Id>();

  const onConfirm = async () => {
    toastId.current = loadingNotification("Transaction pending...");
    try {
      setReceipt(await executeContractWrite(
        WriteFunctions.updateShares,
        [
          poolAddress,
          [
            BigInt((Number(rewardsValues.owner) * POOL_SHARES_BASE).toFixed(0)),
            BigInt((Number(rewardsValues.keyholder) * POOL_SHARES_BASE).toFixed(0)),
            BigInt((Number(rewardsValues.staker) * POOL_SHARES_BASE).toFixed(0))
          ],
        ],
        chainId,
        writeContractAsync,
        switchChain
      ) as `0x${string}`);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current as Id, true);
    }
  };

  const updateOnSuccess = useCallback(() => {
    updateNotification(
      "Your rewards were updated successfully",
      toastId.current as Id,
      false,
      receipt,
      chainId
    );
    router.push(`/pool/${poolAddress}/summary`);
  }, [receipt, chainId, router, poolAddress])

  const updateOnError = useCallback(() => {
    const error = mapWeb3Error(status);
    updateNotification(error, toastId.current as Id, true);
  }, [status])

  useEffect(() => {

    if (isSuccess) {
      updateOnSuccess();
    }
    if (isError) {
      updateOnError();
    }
  }, [isSuccess, isError, updateOnSuccess, updateOnError]);

  return (
    <>
      {!isLoading && (
        <div className="flex w-full flex-col items-center md:w-2/3">
          <div className="sm:p-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full mb-2">
            <ButtonBack onClick={() => router.push('/pool')} btnText="BACK TO MY POOLS" extraClasses="text-lg mb-3 text-white font-bold sm:px-4 lg:px-0" />
            <MainTitle title={"Edit reward breakdown"} classNames="!mb-0 sm:px-4 lg:px-0" />
          </div>
          <div className="flex relative flex-col bg-nulnOilBackground text-left px-6 shadow-default py-5 w-full p-3">
            <BaseCallout isWarning extraClasses={{ calloutWrapper: "w-full text-lg", calloutFront: "!justify-start !items-start" }}>
              <WarningIcon className="mr-2 min-w-[27px]"/>
              {`Reward breakdown changes will have a waiting period of ${rewardBreakdownDelay}
               before going into effect.`}
            </BaseCallout>
          </div>
          <div className="sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <RewardComponent
              rewardsValues={rewardsValues}
              setRewardsValues={setRewardsValues}
              setError={setErrorValidationRewards}
              hideTitle={true}
              showErrors={true}
            />
          </div>
          <div className="flex sm:flex-col-reverse lg:flex-row justify-between w-full py-5 px-6 bg-nulnOilBackground shadow-default">
            <PrimaryButton btnText="Cancel" onClick={() => router.back()} colorStyle="outline" className="sm:w-full lg:w-[205px] uppercase" />
            <PrimaryButton
              btnText="Save and continue"
              onClick={onConfirm}
              className="font-semibold uppercase sm:w-full lg:w-[305px] sm:mb-5 lg:mb-0"
              isDisabled={errorValidationRewards || transactionLoading}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EditRewardsComponent;
