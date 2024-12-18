"use client";

import React, { useEffect, useState } from "react";
import { PrimaryButton, TextButton } from "@/app/components/ui/buttons";
import { CloseIcon } from "@/app/components/icons/IconsComponent";
import MainTitle from "../titles/MainTitle";
import {
  getCurrentNodeLicensePriceInXai,
  getNetwork,
} from "@/services/web3.service";
import { useAccount } from "wagmi";

interface StakingClaimTinyKeysModalComponentProps {
  totalClaimAmount: number;
  isSuccess: boolean;
}

const StakingClaimModalComponent = ({
  totalClaimAmount,
  isSuccess,
}: StakingClaimTinyKeysModalComponentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyPriceInEsXAI, setKeyPriceInEsXAI] = useState(0);
  const { chainId } = useAccount();

  const handleClose = () => {
    setIsOpen(false);
  };
  
  useEffect(() => {

    const setXaiPrice = async () => {
      const network = getNetwork(chainId);
      const nodeLicensePriceInXai = parseFloat(
        (await getCurrentNodeLicensePriceInXai(network, 2)).price
      );
      setKeyPriceInEsXAI(nodeLicensePriceInXai);
  
      const claimIsMoreThanKeyPrice = parseFloat(totalClaimAmount.toString()) >= nodeLicensePriceInXai;
      setIsOpen(isSuccess && claimIsMoreThanKeyPrice);
    };
    
    if (totalClaimAmount > 0 && isSuccess) {
      setXaiPrice();
    }
  }, [isSuccess, totalClaimAmount, chainId]);

  return (
    <>
      {isOpen && (
        <>
          <div
            className="w-full h-full bg-black/75 fixed top-0 left-0 z-40 animate-modal-appear"
            onClick={handleClose}
          ></div>
          <div className="bg-black fixed top-2/4 animate-modal-appear left-2/4 -translate-x-2/4 -translate-y-2/4 z-50 h-max w-full max-w-[700px] p-[15px] border-3 border-pelati">
            <span
              className="absolute right-[15px] top-[22px] cursor-pointer modal-close"
              onClick={handleClose}
            >
              <CloseIcon width={15} height={15} fill="#fff" />
            </span>
            <span className="block font-bold text-white text-2xl mb-[18px]">
              Claim Successful
            </span>
            <MainTitle
              title={`You've successfully claimed ${parseFloat(
                totalClaimAmount.toFixed(2)
              )} esXAI!`}
              classNames="lg:text-[30px] sm:text-[24px] font-bold text-white !lg:mb-0 !mb-2 normal-case"
            />
            <MainTitle
              title={`You can buy more keys for ${keyPriceInEsXAI} esXAI each!`}
              classNames="lg:text-[30px] sm:text-[24px] font-bold text-white !lg:mb-0 !mb-2 normal-case"
            />
            <div className="flex justify-end items-end mt-2">
              <TextButton
                buttonText="Close"
                onClick={handleClose}
                textClassName="!text-lg !font-bold"
              />
              <a
                href="https://sentry.xai.games/"
                target="_blank"
                rel="noreferrer"
              >
                <PrimaryButton
                  btnText="Buy Now"
                  onClick={() => console.log("Success")}
                  size="sm"
                  isDisabled={false}
                />
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StakingClaimModalComponent;
