import {
  ACTIVE_NETWORK_IDS,
  OrderedRedemptions,
  RedemptionRequest,
  getNetwork,
  getWeb3Instance,
  mapWeb3Error,
} from "@/services/web3.service";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import { PrimaryButton } from "../buttons/ButtonsComponent";
import InfoComponent from "./InfoComponent";
import { useAccount, useWriteContract } from "wagmi";
import { useState } from "react";
import { esXaiAbi } from "@/assets/abi/esXaiAbi";
import {
  loadingNotification,
  updateNotification,
} from "../notifications/NotificationsComponent";
import { Id } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSwitchChain } from "wagmi";

interface OverviewCardProps {
  title: string;
  redemptions?: OrderedRedemptions;
}

export const CardComponent = ({ title, redemptions }: OverviewCardProps) => {
  const { chainId } = useAccount();
  const [transactionLoading, setTransactionLoading] = useState(false);
  const router = useRouter();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();

  const completeEsXaiRedemption = async (index: number) => {
    return writeContractAsync({
      address: getWeb3Instance(getNetwork(chainId)).esXaiAddress as `0x${string}`,
      abi: esXaiAbi,
      functionName: "completeRedemption",
      args: [BigInt(index)],
    });
  };

  const onClaim = async (redemption: RedemptionRequest) => {
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
      receipt = await completeEsXaiRedemption(redemption.index);
      onSuccess(receipt, loading);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
    }
  };

  const onSuccess = async (receipt: string, loadingToast: Id) => {
    updateNotification(`Claim successful`, loadingToast, false, receipt, chainId);
    setTimeout(() => {
      setTransactionLoading(false);
      router.refresh();
    }, 3000);
  };

  return (
    <BorderWrapperComponent customStyle="flex flex-row justify-between items-center">
      <InfoComponent title={title} redemptions={redemptions} />
      <div className="flex justify-end lg:pr-6 sm:pr-3">
        {(redemptions?.claimable.length && redemptions?.claimable.length > 0) ? <PrimaryButton
          btnText="Claim"
          onClick={() => onClaim(redemptions?.claimable[0]!)}
          className="w-[115px] h-[50px] font-semibold"
          isDisabled={transactionLoading}
        /> : ""}
      </div>
    </BorderWrapperComponent>
  );
};
