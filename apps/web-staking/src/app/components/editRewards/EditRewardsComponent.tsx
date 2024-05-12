'use client';

import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ButtonBack,
  PrimaryButton,
  SecondaryButton,
} from "../buttons/ButtonsComponent";
import { useRouter } from "next/navigation";
import { ErrorCircle } from "../icons/IconsComponent";
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
        <div className="flex w-full flex-col items-center md:w-2/3 sm:px-3">
          <div className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full mb-2">
            <ButtonBack onClick={() => router.back()} btnText="Back" />
            <MainTitle title={"Edit reward breakdown"} classNames="!mb-0" />
          </div>
          <div className="flex relative flex-col mb-4 bg-[#FFF9ED] text-left px-[40px] py-[15px] w-full p-3 rounded-xl">
            <div className="absolute top-4 left-3">
              <ErrorCircle width={20} height={20} />
            </div>
            <span className="text-[#C36522]">
              {`Reward breakdown changes will have a waiting period of ${rewardBreakdownDelay}
              before going into effect.`}
            </span>
          </div>
          <div className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <RewardComponent
              rewardsValues={rewardsValues}
              setRewardsValues={setRewardsValues}
              setError={setErrorValidationRewards}
              hideTitle={true}
              showErrors={true}
            />
          </div>
          <div className="flex flex-row justify-between w-full border-t-1 py-6">
            <SecondaryButton btnText="Cancel" onClick={() => router.back()} />
            <PrimaryButton
              btnText="Save and continue"
              onClick={onConfirm}
              className="font-semibold disabled:opacity-50"
              isDisabled={errorValidationRewards || transactionLoading}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EditRewardsComponent;
