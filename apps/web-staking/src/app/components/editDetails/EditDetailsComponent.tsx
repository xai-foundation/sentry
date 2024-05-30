"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGetPoolInfoHooks } from "@/app/hooks/hooks";
import { useRouter } from "next/navigation";
import PoolDetailsComponent from "../createPool/PoolDetailsComponent";
import { ButtonBack } from "../buttons/ButtonsComponent";
import MainTitle from "../titles/MainTitle";
import SocialLinksComponent from "../createPool/SocialLinksComponent";
import {
  loadingNotification,
  updateNotification,
} from "../notifications/NotificationsComponent";
import { ZERO_ADDRESS, mapWeb3Error } from "@/services/web3.service";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import DelegateAddressComponent from "../createPool/DelegateAddressComponent";
import { Id } from "react-toastify";
import { PrimaryButton } from "../ui";

const EditDetailsComponent = ( { bannedWords }: { bannedWords: string[] }) => {
  const {
    poolDetailsValues,
    setPoolDetailsValues,
    socialLinks,
    setSocialLinks,
    isLoading,
    poolAddress,
    delegateAddress,
    setDelegateAddress,
  } = useGetPoolInfoHooks();
  const { address, chainId } = useAccount();
  const [receipt, setReceipt] = useState<`0x${string}` | undefined>();
  const [isUpdateAddress, setIsUpdateAddress] = useState(false);

  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [errorValidationDetails, setErrorValidationDetails] = useState({
    name: false,
    description: false,
    logoUrl: false,
    trackerName: false,
    trackerTicker: false,
  });
  const [errorValidationAddress, setErrorValidationAddress] = useState(false);

  // Substitute Timeouts with useWaitForTransaction
  const { isError, isLoading: transactionLoading, isSuccess, status } = useWaitForTransactionReceipt({
    hash: receipt,
  });

  const router = useRouter();

  const toastId = useRef<Id>();

  const updateOnSuccess = useCallback(() => {
    updateNotification(
      `${isUpdateAddress ? "Your pool delegate address was updated successfully" : "Your pool details were updated successfully"}`,
      toastId.current as Id,
      false,
      receipt,
      chainId
    );
    router.push(`/pool/${poolAddress}/summary`);
  }, [receipt, chainId, isUpdateAddress, poolAddress, router])

  const updateOnError = useCallback(() => {
    const error = mapWeb3Error(status);
    updateNotification(error, toastId.current as Id, true);
  }, [status])

  useEffect(() => {

    if (isSuccess) {
      updateOnSuccess();
    }
    if (isError) {
      updateOnError()
    }
  }, [isSuccess, isError, updateOnSuccess, updateOnError]);

  const onConfirm = async () => {
    setIsUpdateAddress(false);
    toastId.current = loadingNotification("Transaction pending...");
    try {
      
      setReceipt(await executeContractWrite(
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
        ) as `0x${string}`);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current as Id, true);
    }
  };

  const onConfirmEditAddress = async () => {
    setIsUpdateAddress(true);
    toastId.current = loadingNotification("Transaction pending...");
    try {
      setReceipt(await executeContractWrite(
          WriteFunctions.updateDelegateOwner,
          [poolAddress, delegateAddress || ZERO_ADDRESS],
          chainId,
          writeContractAsync,
          switchChain
        ) as `0x${string}`);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, toastId.current as Id, true);
    }
  };

  const searchDetailsErrors = () => {
    return Object.values(errorValidationDetails).some((item) => item === true);
  };

  return (
    <>
      {!isLoading && (
        <div className="flex w-full flex-col items-center md:w-2/3">
          <div className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <ButtonBack onClick={() => router.push('/pool')} btnText="BACK TO MY POOLS" extraClasses="text-lg mb-4 text-white font-bold sm:px-4 lg:px-0" />
            <MainTitle title={"Edit pool"} classNames="!mb-0 sm:px-4 lg:px-0" />
          </div>
          <div className="sm:pb-5 lg:py-0 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <PoolDetailsComponent
              poolDetailsValues={poolDetailsValues}
              setPoolDetailsValues={setPoolDetailsValues}
              setError={setErrorValidationDetails}
              bannedWords={bannedWords}
              hideTokenTrackers={true}
              showErrors={true}
            />
            <SocialLinksComponent
              socialLinks={socialLinks}
              setSocialLinks={setSocialLinks}
              editStyles={true}
            />
          </div>
          <div className="flex sm:flex-col-reverse lg:flex-row justify-between w-full py-5 px-6 mb-[10px] bg-nulnOilBackground shadow-default">
            <PrimaryButton btnText="Cancel" onClick={() => router.back()} colorStyle="outline" className="sm:w-full lg:w-[205px] uppercase" />
            <PrimaryButton
              btnText="Save and confirm"
              onClick={onConfirm}
              className="font-semibold uppercase sm:w-full lg:w-[305px] sm:mb-5 lg:mb-0"
              isDisabled={searchDetailsErrors() || transactionLoading}
            />
          </div>
          <div className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <DelegateAddressComponent
              ownerAddress={address}
              delegateAddress={delegateAddress}
              setDelegateAddress={setDelegateAddress}
              error={errorValidationAddress}
              setError={setErrorValidationAddress}
              showErrors={true}
              editStyles={true}
            />
            <div className="flex sm:flex-col-reverse lg:flex-row justify-between w-full py-5 px-6 lg:mb-[30px] bg-nulnOilBackground shadow-default">
              <PrimaryButton btnText="Cancel" onClick={() => router.back()} colorStyle="outline" className="sm:w-full lg:w-[205px] uppercase" />
              <PrimaryButton
                btnText="Save and confirm"
                onClick={onConfirmEditAddress}
                className="font-semibold uppercase sm:w-full lg:w-[305px] sm:mb-5 lg:mb-0"
                isDisabled={
                  errorValidationAddress ||
                  transactionLoading
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
