import {
  ACTIVE_NETWORK_IDS,
  OrderedRedemptions,
  RedemptionRequest,
  mapWeb3Error,
} from "@/services/web3.service";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import { PrimaryButton } from "../buttons/ButtonsComponent";
import InfoComponent from "./InfoComponent";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadingNotification,
  updateNotification,
} from "../notifications/NotificationsComponent";
import { Id } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSwitchChain } from "wagmi";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";

interface OverviewCardProps {
  title: string;
  redemptions?: OrderedRedemptions;
}

export const CardComponent = ({ title, redemptions }: OverviewCardProps) => {
  const { chainId } = useAccount();
  const router = useRouter();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();

  const { data, isError, isLoading, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
  });

  const toastId = useRef<Id>();


  const onClaim = async (redemption: RedemptionRequest) => {
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
        [BigInt(redemption.index)],
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
    updateNotification(`Claim successful`, toastId.current as Id, false, receipt, chainId);
    router.refresh();
  }, [receipt, chainId, router])

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
    <BorderWrapperComponent customStyle="flex flex-row justify-between items-center">
      <InfoComponent title={title} redemptions={redemptions} />
      <div className="flex justify-end lg:pr-6 sm:pr-3">
        {(redemptions?.claimable.length && redemptions?.claimable.length > 0) ? <PrimaryButton
          btnText="Claim"
          onClick={() => onClaim(redemptions?.claimable[0]!)}
          className="w-[115px] h-[50px] font-semibold"
          isDisabled={isLoading}
        /> : ""}
      </div>
    </BorderWrapperComponent>
  );
};
