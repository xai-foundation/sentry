"use client";

import { useAccount, useSwitchChain, useWriteContract } from "wagmi";

import {
  ACTIVE_NETWORK_IDS,
  getNetwork,
  getWeb3Instance,
  mapWeb3Error,
} from "@/services/web3.service";

import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import MainTitle from "../titles/MainTitle";

import { RefereeAbi } from "@/assets/abi/RefereeAbi";
import { useState } from "react";
import {
  loadingNotification,
  updateNotification,
} from "../notifications/NotificationsComponent";
import { Id } from "react-toastify";
import { useRouter } from "next/navigation";
import { esXaiAbi } from "@/assets/abi/esXaiAbi";

interface ReviewStakeProps {
  onBack: () => void;
  title: string;
  inputValue?: number;
  totalStaked?: number;
  unstake?: boolean;
  approved: boolean;
  maxStake: number;
}

const ReviewStakeComponent = ({
  onBack,
  title,
  inputValue,
  totalStaked,
  unstake,
  approved,
  maxStake
}: ReviewStakeProps) => {
  const router = useRouter();
  const { address, chainId } = useAccount();
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [tokensApproved, setTokensApproved] = useState(approved);

  const network = getNetwork(chainId);

  const { writeContractAsync } = useWriteContract();
	const { switchChain } = useSwitchChain();

  const onStake = async (amount: number) => {
    const weiAmount = getWeb3Instance(network).web3.utils.toWei(
      amount,
      "ether"
    );
    return writeContractAsync({
      address: getWeb3Instance(network).refereeAddress as `0x${string}`,
      abi: RefereeAbi,
      functionName: "stake",
      args: [BigInt(weiAmount)],
    });
  };

  const onUnstake = async (amount: number) => {
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
      args: [getWeb3Instance(network).refereeAddress as `0x${string}`, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")],
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
    let receipt;
    setTransactionLoading(true);
    const loading = loadingNotification("Transaction is pending...");
    try {
      // TODO: check eth balance enough for gas
      if (unstake) {
        receipt = await onUnstake(inputValue || 0);
      } else {
        receipt = await onStake(inputValue || 0);
      }
      onSuccess(receipt, loading);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
      setTimeout(() => router.push("/staking"), 3000);
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
    let receipt;
    setTransactionLoading(true);
    const loading = loadingNotification("Approval is pending...");
    try {
      receipt = await approveTokens();
      updateNotification(
        `Successfully approved tokens`,
        loading,
        false
      );
      setTimeout(() => setTransactionLoading(false), 3000);
      setTokensApproved(true);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
      setTimeout(() => router.push("/staking"), 3000);
    }
  }

  const onSuccess = async (receipt: string, loadingToast: Id) => {
    updateNotification(
      `You have successfully ${unstake ? "unstaked" : "staked"} ${inputValue} esXai`,
      loadingToast,
      false,
      receipt,
      chainId
    );
    setTimeout(() => {
      setTransactionLoading(false);
      router.push("/staking");
    }, 3000);
  };

  return (
    <main className="flex w-full flex-col items-center">
      <div className="group flex flex-col items-start max-w-xl w-full p-3">
        <ButtonBack onClick={onBack} btnText="Back" />

        <MainTitle title={`Review ${title.toLocaleLowerCase()}`} />

        <HeroStat
          label={unstake ? "You unstake" : "You stake"}
          value={`${inputValue} esXai`}
        />
        <HeroStat
          label={`Your staking balance after this ${unstake ? "unstake" : "stake"
            }`}
          value={
            unstake
              ? `${totalStaked! - inputValue!} esXai`
              : `${inputValue! + totalStaked!} esXai`
          }
        />
        {tokensApproved ?
          <PrimaryButton
            onClick={onConfirm}
            btnText={`${transactionLoading ? "Waiting for confirmation..." : "Confirm"
              }`}
            className={`w-full mt-6 font-bold ${transactionLoading && "bg-[#B1B1B1] disabled"
              }`}
          />
          :
          <PrimaryButton
            onClick={onApprove}
            btnText={`${transactionLoading ? "Waiting for approved tokens..." : "Approve"}`}
            className={`w-full mt-6 font-bold ${transactionLoading && "bg-[#B1B1B1] disabled"}`}
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
