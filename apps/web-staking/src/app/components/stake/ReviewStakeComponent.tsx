"use client";

import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import {
  ACTIVE_NETWORK_IDS,
  addUnstakeRequest,
  getNetwork,
  getWeb3Instance,
  getWeiAmount,
  mapWeb3Error,
} from "@/services/web3.service";

import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import MainTitle from "../titles/MainTitle";

import { RefereeAbi } from "@/assets/abi/RefereeAbi";
import { useEffect, useRef, useState } from "react";
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

interface ReviewStakeProps {
  onBack: () => void;
  title: string;
  inputValue?: string;
  totalStaked?: number;
  unstake?: boolean;
  approved: boolean;
  maxStake: number;
  pool?: PoolInfo;
}

const ReviewStakeComponent = ({
  onBack,
  title,
  inputValue,
  totalStaked,
  unstake,
  approved,
  maxStake,
  pool
}: ReviewStakeProps) => {
  const router = useRouter();
  const { address, chainId } = useAccount();
  const [tokensApproved, setTokensApproved] = useState(approved);
  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();

  const network = getNetwork(chainId);

  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();

  // Substitute Timeouts with useWaitForTransaction
  const { data, isError, isLoading, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
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
    // const weiAmount = getWeb3Instance(network).web3.utils.toWei(
    //   maxStake,
    //   "ether"
    // );
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
            [pool.address, BigInt(getWeiAmount(Number(inputValue)))],
            chainId,
            writeContractAsync,
            switchChain
          ) as `0x${string}`);
        } else {
          setReceipt(await onUnstake(inputValue || "0"));
        }


      } else {
        if (!pool) {
          return;
        }
        setReceipt(await executeContractWrite(
          WriteFunctions.stakeEsXai,
          [pool.address, BigInt(getWeiAmount(Number(inputValue)))],
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
      setReceipt(await approveTokens());
      updateNotification(
        `Successfully approved tokens`,
        toastId.current as Id,
        false
      );
      setTokensApproved(true);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current as Id, true);
      router.push(`/pool/${pool?.address}/summary`);
    }
  }

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
    }
    if (isError) {
      router.push(`/pool/${pool?.address}/summary`);
      const error = mapWeb3Error(status);
      updateNotification(error, toastId.current as Id, true);
    }
  }, [isSuccess, isError]);

  const onSuccess = async () => {
    updateNotification(
      `You have successfully ${unstake ? "unstaked" : "staked"} ${inputValue} esXai`,
      toastId.current as Id,
      false,
      receipt,
      chainId
    );
    if (pool) {

      if (unstake) {
        addUnstakeRequest(getNetwork(chainId), address!, pool.address)
          .then(() => {
            router.push(`/pool/${pool.address}/summary`);
          })
      } else {
        router.push(`/pool/${pool.address}/summary`);
      }
    } else {
      router.push(`/staking`);
    }
  };

  const getUnstakeLabel = () => {
    if (pool) {
      return (totalStaked! - Number(inputValue!)).toFixed(2);
    }

    return `${totalStaked! - Number(inputValue!)} esXai`;
  }

  return (
    <main className="flex w-full flex-col items-center">
      <div className="group flex flex-col items-start max-w-xl w-full p-3">
        <ButtonBack onClick={onBack} btnText="Back" />

        <MainTitle title={`Review ${title.toLocaleLowerCase()}`} />

        <HeroStat
          label={unstake ? "You unstake" : "You stake"}
          value={`${inputValue} esXai`}
        />

        {pool && <div className="flex items-center mb-4">
          <span className="mr-2">Staking to:</span>
          <Avatar src={pool.meta.logo} className="w-[32px] h-[32px] mr-2" />
          <span className="text-graphiteGray">{pool.meta.name}</span>
        </div>}

        <HeroStat
          label={`Your staking balance after this ${unstake ? "unstake" : "stake"}`}
          value={
            unstake
              ? `${getUnstakeLabel()}`
              : `${Number(inputValue!) + totalStaked!} esXai`
          }
        />
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
            btnText={`${isLoading ? "Waiting for approved tokens..." : "Approve"}`}
            className={`w-full mt-6 font-bold ${isLoading && "bg-[#B1B1B1] disabled"}`}
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
