import { useState } from "react";
import {
  ButtonBack,
  PrimaryButton,
  SecondaryButton,
} from "../buttons/ButtonsComponent";
import { useRouter } from "next/navigation";
import { ErrorCircle } from "../icons/IconsComponent";
import RewardComponent from "../createPool/RewardComponent";
import MainTitle from "../titles/MainTitle";
import { useGetPoolInfoHooks } from "@/app/hooks/hooks";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import {
  loadingNotification,
  updateNotification,
} from "../notifications/NotificationsComponent";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { POOL_SHARES_BASE, mapWeb3Error } from "@/services/web3.service";
import { sendUpdatePoolRequest } from "@/services/requestService";

const EditRewardsComponent = () => {
  const { rewardsValues, setRewardsValues, isLoading, poolAddress } =
    useGetPoolInfoHooks();
  const [errorValidationRewards, setErrorValidationRewards] = useState(false);
  const router = useRouter();
  const { chainId } = useAccount();
  const [transactionLoading, setTransactionLoading] = useState(false);

  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const onConfirm = async () => {
    setTransactionLoading(true);
    const loading = loadingNotification("Transaction pending...");
    try {
      const receipt = await executeContractWrite(
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
      );

      setTimeout(async () => {
        updateNotification(
          "Your rewards were updated successfully",
          loading,
          false,
          receipt,
          chainId
        );
        setTransactionLoading(false);

        // Update Rewards on Data base
        await updateRewardsOnDb(poolAddress, chainId);

        router.push(`/pool/${poolAddress}/summary`);
      }, 3000);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
    }
  };

  const updateRewardsOnDb = async (poolAddress: string, chainId: number | undefined): Promise<any> => {
    await sendUpdatePoolRequest(poolAddress, chainId);
  }

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
              Reward breakdown changes will have a waiting period of 30 days
              before going into effect.
            </span>
          </div>
          <div className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <RewardComponent
              rewardsValues={rewardsValues}
              setRewardsValues={setRewardsValues}
              setError={setErrorValidationRewards}
              hideTitle
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
