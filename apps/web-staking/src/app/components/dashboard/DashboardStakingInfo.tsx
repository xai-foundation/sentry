import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Id } from "react-toastify";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { ExternalLinkComponent } from "@/app/components/links/LinkComponent";
import {
  loadingNotification,
  updateNotification,
} from "@/app/components/notifications/NotificationsComponent";
import {
  useGetRedemptionsHooks,
  useGetUserTotalStakedKeysCount,
} from "@/app/hooks/hooks";
import {
  ACTIVE_NETWORK_IDS,
  mapWeb3Error,
  RedemptionRequest,
} from "@/services/web3.service";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import ClaimableRewardsComponent from "@/app/components/staking/ClaimableRewardsComponent";
import { formatCurrencyWithDecimals } from "@/app/utils/formatCurrency";
import { PrimaryButton } from "@/app/components/ui";

interface DashboardStakingInfoProps {
  totalStaked: number;
  totalClaimableAmount: number;
  onClaimRewards: () => void;
  rewardsTransactionLoading: boolean;
}

const DashboardStakingInfo = ({
  totalStaked,
  totalClaimableAmount,
  onClaimRewards,
  rewardsTransactionLoading
}: DashboardStakingInfoProps) => {
  const { stakedKeysAmount } = useGetUserTotalStakedKeysCount();
  const {
    redemptions: { claimable },
  } = useGetRedemptionsHooks();
  const calculatedClaimableRedemptions = claimable.reduce((acc, redemption) => {
    return (acc += redemption.receiveAmount);
  }, 0);

  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
  const [currentTotalClaimableAmount, setCurrentTotalClaimableAmount] = useState<number>(totalClaimableAmount);
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const router = useRouter();

  // Substitute Timeouts with useWaitForTransaction
  const { data, isError, isLoading, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
  });

  useEffect(() => {
    setCurrentTotalClaimableAmount(totalClaimableAmount);
  }, [totalClaimableAmount]);


  const toastId = useRef<Id>();

  const onClaimXaiRedemptions = async (redemption: RedemptionRequest) => {
    if (!chainId) {
      return;
    }
    if (!ACTIVE_NETWORK_IDS.includes(chainId)) {
      switchChain({ chainId: ACTIVE_NETWORK_IDS[0] });
      return;
    }
    toastId.current = loadingNotification("Transaction is pending...");
    try {
      setReceipt(await executeContractWrite(
        WriteFunctions.completeRedemption,
        [
          BigInt(redemption.index)
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
      "Claim successful",
      toastId.current as Id,
      false,
      receipt,
      chainId,
    );
    router.refresh();
  }, [chainId, receipt, router])

  const updateOnError = useCallback(() => {
    const error = mapWeb3Error(status);
    updateNotification(error, toastId.current as Id, true);
    router.refresh();
  }, [status, router])

  useEffect(() => {

    if (isSuccess) {
      updateOnSuccess();
    }
    if (isError) {
      updateOnError();
    }
  }, [isSuccess, isError, updateOnSuccess, updateOnError]);


  return (
    <section className="mt-10 mb-14 w-full">
      <div
        className="flex w-full items-center justify-between py-[17px] md:px-[25px] px-[17px] bg-nulnOil/75 border-b-1 border-chromaphobicBlack shadow-default">
        <h3 className="md:text-3xl text-2xl text-white font-bold">
          Redemptions
        </h3>
        <ExternalLinkComponent
          link={`/redeem`}
          content={"Manage redemptions"}
          customClass="uppercase !font-bold !text-lg"
        />
      </div>
      <div
        className="flex w-full justify-between items-center md:gap-x-10 gap-x-[54px] md:px-[25px] px-[17px] flex-wrap h-full py-[17px] bg-dynamicBlack shadow-default">
        <div className="flex flex-col justify-between ">
          <span className="block text-elementalGrey text-lg font-medium">XAI redemptions</span>
          <span className="text-2xl font-semibold text-white">
            {calculatedClaimableRedemptions} XAI
          </span>
        </div>
        {calculatedClaimableRedemptions > 0 && (
          <PrimaryButton
            btnText="Claim"
            onClick={() => onClaimXaiRedemptions(claimable[0]!)}
            className="w-full lg:min-w-[160px] min-w-[166px] !py-[5px] !font-bold !text-xl lg:mr-3 uppercase"
            isDisabled={isLoading}
          />
        )}
      </div>

      <div className="mt-10 w-full">
        <div
          className="flex w-full items-center justify-between py-[17px] md:px-[25px] px-[17px] bg-nulnOil/75 border-b-1 border-chromaphobicBlack shadow-default">
          <h3 className="md:text-3xl text-2xl text-white font-bold">
            Staking
          </h3>
          <ExternalLinkComponent
            link={`/staking?chainId=${chainId}`}
            content={"Manage staking"}
            customClass="uppercase !font-bold !text-lg"
          />
        </div>
      </div>
      <div className="flex w-full flex-col justify-between xl:flex-row relative">
        <div
          className="w-full md:px-[25px] px-[17px] flex-wrap h-full py-[17px] bg-dynamicBlack shadow-default">
          <div className="xl:mb-0 flex md:gap-x-10 gap-x-[54px] mb-[94px] flex-wrap ">
          <div className="">
            <span className="block text-elementalGrey text-lg leading-[20px]">Your staked esXAI</span>
            <span className="block text-2xl font-semibold text-white">
              {formatCurrencyWithDecimals.format(totalStaked)}
              <span className="ml-1">esXAI </span>
            </span>
          </div>
          <div className="w-full max-w-max">
            <span className="block text-elementalGrey text-lg leading-[20px]">Your staked keys</span>
            <span className="block text-2xl font-semibold text-white">
              {stakedKeysAmount} keys
            </span>
          </div>
          </div>
          <ClaimableRewardsComponent
            totalClaimAmount={currentTotalClaimableAmount}
            onClaim={onClaimRewards}
            disabled={isLoading || rewardsTransactionLoading || currentTotalClaimableAmount === 0}
            wrapperClasses="absolute left-[17px] xl:left-auto xl:right-[25px] xl:top-[-10px] bottom-[-25px] shadow-default xl:max-w-[456px] max-w-[calc(100%-34px)] w-full"
          />
        </div>

      </div>
    </section>
  )
    ;
};

export default DashboardStakingInfo;
