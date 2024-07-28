import React, { ReactNode, useEffect, useState } from "react";
import { PrimaryButton, TextButton } from "@/app/components/ui/buttons";
import { CloseIcon } from "@/app/components/icons/IconsComponent";

import { listOfCountries } from "../../constants/constants";
import { SearchableDropdown, SearchableDropdownItem } from "../dropdowns/SearchableDropdown";

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
  isDropdown?: boolean;
  selectedCountry?: string | null;
  setSelectedCountry?: React.Dispatch<React.SetStateAction<string | null>>;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
  isError?: boolean;
  errorMessage?: string;
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
                     submitText = "Submit",
                     isDropdown = false,
                     selectedCountry,
                     setSelectedCountry,
                     isOpen,
                     setIsOpen,
                     isError,
                     errorMessage
                   }: BaseModalProps) => {
  useEffect(() => {
    if (isOpened) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
  }, [isOpened]);

  function onClickHelper() {
    if (selectedCountry) {
      if (
				selectedCountry === "China" || 
				selectedCountry === "Hong Kong" || 
				selectedCountry === "Republic of North Macedonia" ||
				selectedCountry === "Turkey" || 
				selectedCountry === "Ukraine" 	 
        ) {
          return window.open(`https://verify-with.blockpass.org/?clientId=xai_sentry_node__edd_60145`, "_blank",
          "noopener noreferrer");
			} else if (selectedCountry !== "") {
        return window.open(`https://verify-with.blockpass.org/?clientId=xai_node_007da`, "_blank",
        "noopener noreferrer");
			}
		} else {
      return
		}
	}

  const countries: JSX.Element[] = listOfCountries.filter(item => item.label.toLocaleLowerCase().startsWith(selectedCountry?.toLowerCase()!)).map((item, i, arr) => (
    <SearchableDropdownItem
				onClick={() => {
					setSelectedCountry && setSelectedCountry(item.label);
					setIsOpen && setIsOpen(false);
      }}
      dropdownOptionsCount={arr.length}
				key={`sentry-item-${i}`}
        extraClasses={"hover:!bg-velvetBlack"}
			>
				{item.label}
    </SearchableDropdownItem>))
  
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
            {isDropdown && <SearchableDropdown dropdownOptionsCount={countries.length} isOpen={isOpen!} selectedValue={selectedCountry!} selectedValueRender={selectedCountry!} setSelectedValue={setSelectedCountry!} setIsOpen={setIsOpen!} getDropdownItems={() => countries} extraClasses={{ dropdown: "!w-full my-3", dropdownOptions: "!w-full" }} isInvalid={isError}  />}
            {isError && <span className="block text-lg font-medium text-[#F76808]">{errorMessage}</span>}
            <div className="flex justify-end items-end mt-2">
              {!withOutCancelButton &&
                <TextButton buttonText={cancelText} onClick={closeModal} textClassName="!text-lg !font-bold" />}
              <PrimaryButton onClick={isDropdown ? onClickHelper : onSubmit} btnText={submitText} size="sm" isDisabled={isDisabled} />
            </div>
          </div>
        </>
      }
    </>
  )
    ;
};

export default BaseModal;