"use client";

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import {  PrimaryButton } from "@/app/components/ui";
import MainTitle from "../titles/MainTitle";
import { useEffect, useState } from "react";

interface StakingClaimTinyKeysModalProps {
  totalClaimAmount: number;
  isSuccess: boolean;
}

const StakingClaimTinyKeysModalComponent = ({ totalClaimAmount, isSuccess}: StakingClaimTinyKeysModalProps) => {    
const [modalIsOpen, setModalIsOpen] = useState(isSuccess);

const handleClose = () => {
  setModalIsOpen(false);
};

useEffect(() => {
  console.log("tempIsSuccess changed:", isSuccess);
  if (isSuccess) {
    console.log("Opening modal");
    setModalIsOpen(true); // Open modal when tempIsSuccess is true
  }
}, [isSuccess]);

  return (
    <Modal
    size="xl"
    radius="sm"
    isOpen={modalIsOpen}
    className="sm:w-full sm:mx-0 max-w-[600px] max-h-[600px] min-h-[300px] bg-nulnOil !opacity-95 mt-[100px] border-3 border-pelati"
     classNames={{
       backdrop: "bg-nulnOil !opacity-50 w-full h-full",
     }}
    hideCloseButton={false}
  >
    <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1 text-white mt-3 z-100000">
          <MainTitle title={` You've successfully claimed ${parseFloat(totalClaimAmount.toFixed(2))} esXAI! `} classNames="lg:text-[30px] sm:text-[24px] font-bold text-white !lg:mb-0 !mb-2 normal-case" />
          </ModalHeader>

          <ModalBody className="text-white">
          <MainTitle title={` You can buy more keys for [esXai Price] esXAI each! `} classNames="lg:text-[30px] sm:text-[24px] font-bold text-white !lg:mb-0 !mb-2 normal-case" />

          </ModalBody>
          <ModalFooter>
            <PrimaryButton
              btnText={"CLOSE"}
              onClick={handleClose}            
              className="w-full disabled:opacity-50 p-5"
              colorStyle="outline"
            />
            <a
              href="https://sentry.xai.games/"
              target="_blank"
              rel="noreferrer"
              >
            <PrimaryButton
              btnText={"BUY NOW"}
              onClick={() => console.log("Success") }
              isDisabled={false}
              className="w-full disabled:opacity-50"
            />
            </a>
          </ModalFooter>
        </>
    </ModalContent>
  </Modal>

  );
};

export default StakingClaimTinyKeysModalComponent;
