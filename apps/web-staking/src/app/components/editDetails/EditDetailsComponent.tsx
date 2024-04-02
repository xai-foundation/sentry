import { useState } from "react";
import { useGetPoolInfoHooks } from "@/app/hooks/hooks";
import { useRouter } from "next/navigation";
import PoolDetailsComponent from "../createPool/PoolDetailsComponent";
import {
  ButtonBack,
  PrimaryButton,
  SecondaryButton,
} from "../buttons/ButtonsComponent";
import MainTitle from "../titles/MainTitle";
import SocialLinksComponent from "../createPool/SocialLinksComponent";
import {
  loadingNotification,
  updateNotification,
} from "../notifications/NotificationsComponent";
import { ZERO_ADDRESS, getNetwork, mapWeb3Error } from "@/services/web3.service";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { post, sendUpdatePoolRequest } from "@/services/requestService";
import DelegateAddressComponent from "../createPool/DelegateAddressComponent";

const EditDetailsComponent = () => {
  const {
    poolDetailsValues,
    rewardsValues,
    setPoolDetailsValues,
    tokenTracker,
    setTokenTracker,
    socialLinks,
    setSocialLinks,
    isLoading,
    poolAddress,
    delegateAddress,
    setDelegateAddress,
  } = useGetPoolInfoHooks();
  const { address, chainId } = useAccount();
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionAddressLoading, setTransactionAddressLoading] = useState(false);

  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [errorValidationDetails, setErrorValidationDetails] = useState(false);
  const [errorValidationAddress, setErrorValidationAddress] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    setTransactionLoading(true);
    const loading = loadingNotification("Transaction pending...");
    try {


      const receipt = await executeContractWrite(
        WriteFunctions.updatePoolMetadata,
        [
          poolAddress,
          [
            poolDetailsValues.name,
            poolDetailsValues.description,
            poolDetailsValues.logoUrl
          ],
          [
            socialLinks.website,
            socialLinks.discord,
            socialLinks.telegram,
            socialLinks.twitter,
            socialLinks.instagram,
            socialLinks.youTube,
            socialLinks.tiktok,
          ],
        ],
        chainId,
        writeContractAsync,
        switchChain
      );

      setTimeout(async () => {
        updateNotification(
          "Your pool details were updated successfully",
          loading,
          false,
          receipt,
          chainId
        );
        setTransactionLoading(false);

        // Update on Data base
        await updateDetailsOnDb(poolAddress, chainId);

        router.push(`/pool/${poolAddress}/summary`);
      }, 3000);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
    }
  };

  const onConfirmEditAddress = async () => {
    setTransactionAddressLoading(true);
    const loading = loadingNotification("Transaction pending...");
    try {
      const receipt = await executeContractWrite(
        WriteFunctions.updateDelegateOwner,
        [poolAddress, delegateAddress || ZERO_ADDRESS],
        chainId,
        writeContractAsync,
        switchChain
      );

      setTimeout(async () => {
        updateNotification(
          "Your pool delegate address was updated successfully",
          loading,
          false,
          receipt,
          chainId
        );
        setTransactionAddressLoading(false);

        // Update on Data base
        await updateDetailsOnDb(poolAddress, chainId);

        router.push(`/pool/${poolAddress}/summary`);
      }, 3000);
    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionAddressLoading(false);
    }
  };

  const updateDetailsOnDb = async (poolAddress: string, chainId: number | undefined): Promise<any> => {
    await sendUpdatePoolRequest(poolAddress, chainId);
  };

  return (
    <>
      {!isLoading && (
        <div className="flex w-full flex-col items-center md:w-2/3 sm:px-3">
          <div className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full mb-2">
            <ButtonBack onClick={() => router.back()} btnText="Back" />
            <MainTitle title={"Edit pool"} classNames="!mb-0" />
          </div>
          <div className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <PoolDetailsComponent
              poolDetailsValues={poolDetailsValues}
              setPoolDetailsValues={setPoolDetailsValues}
              setError={setErrorValidationDetails}
              tokenTracker={tokenTracker}
              setTokenTracker={setTokenTracker}
              hideTokenTrackers
            />
            <SocialLinksComponent
              socialLinks={socialLinks}
              setSocialLinks={setSocialLinks}
            />
          </div>
          <div className="flex flex-row justify-between w-full border-t-1 py-6">
            <SecondaryButton btnText="Cancel" onClick={() => router.back()} />
            <PrimaryButton
              btnText="Save and confirm"
              onClick={onConfirm}
              className="font-semibold disabled:opacity-50"
              isDisabled={
                errorValidationDetails ||
                transactionLoading ||
                transactionAddressLoading
              }
            />
          </div>
          <div className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <DelegateAddressComponent
              ownerAddress={address}
              delegateAddress={delegateAddress}
              setDelegateAddress={setDelegateAddress}
              error={errorValidationAddress}
              setError={setErrorValidationAddress}
            />
            <div className="flex flex-row justify-between w-full border-t-1 py-6">
              <SecondaryButton btnText="Cancel" onClick={() => router.back()} />
              <PrimaryButton
                btnText="Save and confirm"
                onClick={onConfirmEditAddress}
                className="font-semibold disabled:opacity-50"
                isDisabled={
                  errorValidationAddress ||
                  transactionLoading ||
                  transactionAddressLoading
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditDetailsComponent;
