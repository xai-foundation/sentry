import React, { ReactNode, useEffect } from "react";
import { PrimaryButton, TextButton } from "@/app/components/ui/buttons";
import { CloseIcon } from "@/app/components/icons/IconsComponent";

interface BaseModalProps {
  isOpened: boolean;
  modalBody: string | ReactNode;
  closeModal: () => void;
  onSubmit: () => void;
  modalHeader?: string;
  cancelText?: string;
  submitText?: string;
  withOutCancelButton?: boolean;
  isDisabled?: boolean;
  withOutCloseButton?: boolean;
}

const BaseModal = ({
                     isOpened,
                     modalHeader,
                     modalBody,
                     withOutCloseButton,
                     closeModal,
                     onSubmit,
                     isDisabled,
                     withOutCancelButton,
                     cancelText = "Cancel",
                     submitText = "Submit"
                   }: BaseModalProps) => {
  useEffect(() => {
    if (isOpened) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
  }, [isOpened]);
  return (
    <>
      {isOpened &&
        <>
          <div
            className="w-full h-full bg-black/75 fixed top-0 left-0 z-40 animate-modal-appear"
            onClick={closeModal}
          ></div>
          <div
            className="bg-black fixed top-2/4 animate-modal-appear left-2/4 -translate-x-2/4 -translate-y-2/4 z-50 h-max w-full max-w-[700px] p-[15px]">
            {!withOutCloseButton && <span
              className="absolute right-[15px] top-[22px] cursor-pointer modal-close"
              onClick={() => !isDisabled && closeModal()}
            >
              <CloseIcon
                width={15}
                height={15}
                fill="#fff"
              />
            </span>}
            <span className="block font-bold text-white text-2xl mb-[18px]">{modalHeader}</span>
            <span className="block text-[17px] font-medium text-americanSilver">{modalBody}</span>
            <div className="flex justify-end items-end mt-2">
              {!withOutCancelButton &&
                <TextButton buttonText={cancelText} onClick={closeModal} textClassName="!text-lg !font-bold" />}
              <PrimaryButton onClick={onSubmit} btnText={submitText} size="sm" isDisabled={isDisabled} />
            </div>
          </div>
        </>
      }
    </>
  )
    ;
};

export default BaseModal;