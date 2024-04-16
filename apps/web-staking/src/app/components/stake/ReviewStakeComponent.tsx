"use client";

import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import {
  ACTIVE_NETWORK_IDS,
  addUnstakeRequest,
  getNetwork,
  getWeb3Instance,
  getWeiAmountFromTextInput,
  mapWeb3Error,
} from "@/services/web3.service";

import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import MainTitle from "../titles/MainTitle";

import { RefereeAbi } from "@/assets/abi/RefereeAbi";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadingNotification,
  updateNotification,
} from "../notifications/NotificationsComponent";
import { Id } from "react-toastify";
import { useRouter } from "next/navigation";
import { esXaiAbi } from "@/assets/abi/esXaiAbi";
import { PoolInfo } from "@/types/Pool";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { Avatar } from "@nextui-org/react";
import UnstakeTimeReview from "../stakeKeysComponent.tsx/UnstakeTimeReview";
import { useGetUnstakePeriods } from "@/app/hooks/hooks";

interface ReviewStakeProps {
  onBack: () => void;
  title: string;
  displayValue?: string;
  inputValueWei?: string;
  totalStaked?: number;
  unstake?: boolean;
  approved: boolean;
  pool?: PoolInfo;
}

const ReviewStakeComponent = ({
  onBack,
  title,
  displayValue,
  inputValueWei,
  totalStaked,
  unstake,
  approved,
  pool,
}: ReviewStakeProps) => {
  const router = useRouter();
  const { address, chainId } = useAccount();
  const [tokensApproved, setTokensApproved] = useState(approved);
  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
  const [receiptApprove, setReceiptApprove] = useState<`0x${string}` | undefined>();
  const unstakePeriods = useGetUnstakePeriods();

  const network = getNetwork(chainId);

  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();

  // Substitute Timeouts with useWaitForTransaction
  const { data, isError, isLoading, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
  });

  const { isError: isErrorApprove, isLoading: isLoadingApprove, isSuccess: isSuccessApprove, status: statusApprove } = useWaitForTransactionReceipt({
    hash: receiptApprove,
  });


  const toastId = useRef<Id>();

  const onUnstake = async (amount: string) => {
    const weiAmount = getWeb3Instance(network).web3.utils.toWei(
      amount,
      "ether"
    );
    return writeContractAsync({
      address: getWeb3Instance(network).refereeAddress as `0x${string}`,
      abi: RefereeAbi,
      functionName: "unstake",
      args: [BigInt(weiAmount)],
    });
  };

  const approveTokens = async () => {
    return writeContractAsync({
      address: getWeb3Instance(network).esXaiAddress as `0x${string}`,
      abi: esXaiAbi,
      functionName: "approve",
      args: [getWeb3Instance(network).poolFactoryAddress as `0x${string}`, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")],
    });
  };

  const onConfirm = async () => {

    if (!chainId) {
      return;
    }
    if (!ACTIVE_NETWORK_IDS.includes(chainId)) {
      switchChain({ chainId: ACTIVE_NETWORK_IDS[0] });
      return;
    }
    toastId.current = loadingNotification("Transaction is pending...");
    try {
      // TODO: check eth balance enough for gas
      if (unstake) {
        if (pool) {
          setReceipt(await executeContractWrite(
            WriteFunctions.createUnstakeEsXaiRequest,
            [pool.address, BigInt(inputValueWei || "0")],
            chainId,
            writeContractAsync,
            switchChain
          ) as `0x${string}`);
        } else {
          setReceipt(await onUnstake(displayValue || "0"));
        }


      } else {
        if (!pool) {
          return;
        }
        setReceipt(await executeContractWrite(
          WriteFunctions.stakeEsXai,
          [pool.address, BigInt(inputValueWei || "0")],
          chainId,
          writeContractAsync,
          switchChain
        ) as `0x${string}`);
      }

      // onSuccess(receipt, loading);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current as Id, true);
      router.refresh();
    }
  };

  const onApprove = async () => {

    if (!chainId) {
      return;
    }
    if (!ACTIVE_NETWORK_IDS.includes(chainId)) {
      switchChain({ chainId: ACTIVE_NETWORK_IDS[0] });
      return;
    }

    toastId.current = loadingNotification("Approval is pending...");

    try {
      setReceiptApprove(await approveTokens());
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current as Id, true);
      router.refresh();
      // router.push(`/pool/${pool?.address}/summary`);
    }
  }

  useEffect(() => {
    if (isSuccessApprove) {
      updateNotification(
        `Successfully approved tokens`,
        toastId.current as Id,
        false
      );
      setTokensApproved(true);
      return;
    }
    if (isErrorApprove) {
      updateNotification(
        `Failed to approved tokens`,
        toastId.current as Id,
        true
      );
      return;
    }
  }, [isSuccessApprove, isErrorApprove]);

  const updateOnSuccess = useCallback(() => {
    if (pool) {
      updateNotification(
        unstake ? `You have successfully created an unstake request for ${displayValue} esXAI` : `You have successfully staked ${displayValue} esXAI`,
        toastId.current as Id,
        false,
        receipt,
        chainId
      );
      if (unstake) {
        addUnstakeRequest(getNetwork(chainId), address!, pool.address)
          .then(() => {
            router.push(`/pool/${pool.address}/summary`);
          })
      } else {
        router.push(`/pool/${pool.address}/summary`);
      }
    } else {
      updateNotification(
        unstake ? `You have successfully unstaked ${displayValue} esXAI` : "",
        toastId.current as Id,
        false,
        receipt,
        chainId
      );
      router.push(`/staking`);
    }
  }, [unstake, displayValue, receipt, chainId, pool, router, address])

  const updateOnError = useCallback(() => {
    router.push(`/pool/${pool?.address}/summary`);
    const error = mapWeb3Error(status);
    updateNotification(error, toastId.current as Id, true);
  }, [router, pool, status])

  useEffect(() => {

    if (isSuccess) {
      updateOnSuccess();
    }
    if (isError) {
      updateOnError();
    }
  }, [isSuccess, isError, updateOnSuccess, updateOnError]);



  const getUnstakeLabel = () => {
    if (pool) {
      return (totalStaked! - Number(displayValue!)).toFixed(4);
    }

    return `${(totalStaked! - Number(displayValue!)).toFixed(4)} esXAI`;
  }

  return (
    <main className="flex w-full flex-col items-center">
      <div className="group flex flex-col items-start max-w-xl w-full p-3">
        <ButtonBack onClick={onBack} btnText="Back" />

        <MainTitle title={`Review ${title.toLocaleLowerCase()}`} />

        <HeroStat
          label={unstake ? "You unstake" : "You stake"}
          value={`${displayValue} esXAI`}
        />

        {pool && <div className="flex items-center mb-4">
          <span className="mr-2">Staking to:</span>
          <Avatar src={pool.meta.logo} className="w-[32px] h-[32px] mr-2" />
          <span className="text-graphiteGray">{pool.meta.name}</span>
        </div>}
        {(pool && unstake) && (
          <UnstakeTimeReview period={unstakePeriods.unstakeEsXaiDelayPeriod} />
        )}
        {(!pool || !unstake) && (
          <HeroStat
            label={`Your staking balance after this ${unstake ? "unstake" : "stake"}`}
            value={
              unstake
                ? `${getUnstakeLabel()}`
                : `${Number(displayValue!) + totalStaked!} esXAI`
            }
          />
        )}

        {tokensApproved ?
          <PrimaryButton
            onClick={onConfirm}
            btnText={`${isLoading ? "Waiting for confirmation..." : "Confirm"
              }`}
            className={`w-full mt-6 font-bold ${isLoading && "bg-[#B1B1B1] disabled"
              }`}
          />
          :
          <PrimaryButton
            onClick={onApprove}
            btnText={`${isLoadingApprove ? "Waiting for approved tokens..." : "Approve"}`}
            className={`w-full mt-6 font-bold ${isLoadingApprove && "bg-[#B1B1B1] disabled"}`}
          />
        }

      </div>
    </main>
  );
};

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col mb-4">
      <label className="text-[#4A4A4A] text-sm mb-1">{label}</label>
      <span className="text-lightBlackDarkWhite text-4xl mb-1">{value}</span>
    </div>
  );
}

export default ReviewStakeComponent;
