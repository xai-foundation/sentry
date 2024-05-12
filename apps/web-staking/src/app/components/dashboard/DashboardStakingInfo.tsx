import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Id } from "react-toastify";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { PrimaryButton } from "@/app/components/buttons/ButtonsComponent";
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
    <section className="mb-10 w-full">
      <div
        className="mt-10 flex h-[95px] w-full max-w-[928px] flex-col justify-center rounded-2xl bg-crystalWhite pl-[21px]">
        <div className="flex justify-between">
          <span className="text-graphiteGray">XAI redemptions</span>
          <ExternalLinkComponent
            link={"/redeem"}
            content={"View redemptions"}
            customClass="mr-1 lg:mr-4"
          />
        </div>
        <div className="flex justify-between">
          <span className="mt-1 text-2xl font-medium">
            {calculatedClaimableRedemptions} XAI
          </span>
          {calculatedClaimableRedemptions > 0 && (
            <PrimaryButton
              btnText="Claim"
              onClick={() => onClaimXaiRedemptions(claimable[0]!)}
              className="w-full max-w-[120px] !py-[5px] font-semibold lg:mr-3"
              isDisabled={isLoading}
            />
          )}
        </div>
      </div>

      <div className="mt-10 w-full max-w-[928px]">
        <div className="mb-1 flex justify-between">
          <h3 className="text-xl font-bold text-lightBlackDarkWhite">
            Staking
          </h3>
          <ExternalLinkComponent
            link={`/staking?chainId=${chainId}`}
            content={"Manage staking"}
            customClass="mr-1 lg:mr-4"
          />
        </div>
      </div>
      <div className="flex w-full max-w-[928px] flex-col justify-between xl:flex-row">
        <div
          className="mr-3 mt-[12px] flex sm:flex-col lg:flex-row sm:items-start w-full max-w-full lg:items-center gap-x-14 rounded-2xl bg-crystalWhite px-[21px] sm:py-1 lg:py-0 lg:mr-0 xl:mr-3 xl:max-w-[515px]">
          <div className="">
            <span className="block text-graphiteGray">Staked esXAI</span>
            <span className="mt-1 block text-2xl font-medium">
              {formatCurrencyWithDecimals.format(totalStaked)}
              <span className="ml-1">esXAI </span>  
            </span>
          </div>
          <div>
            <span className="block text-graphiteGray">Staked keys</span>
            <span className="mt-1 block text-2xl font-medium">
              {stakedKeysAmount} keys
            </span>
          </div>
        </div>
        <ClaimableRewardsComponent
          totalClaimAmount={currentTotalClaimableAmount}
          onClaim={onClaimRewards}
          disabled={isLoading || rewardsTransactionLoading || currentTotalClaimableAmount === 0}
          wrapperClasses="mt-[12px]"
        />
      </div>
    </section>
  );
};

export default DashboardStakingInfo;
