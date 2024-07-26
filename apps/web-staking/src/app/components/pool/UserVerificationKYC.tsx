import React, { useState } from "react";
import { useBlockIp } from "@/app/hooks";
import { PrimaryButton } from '../../../../../../packages/ui/src/rebrand/buttons/PrimaryButton';
import ExternalLinkIcon from "../../../../../../packages/ui/src/rebrand/icons/ExternalLinkIcon";
import { listOfCountries } from "../constants/constants";
import { SearchableDropdown, SearchableDropdownItem } from "../ui/dropdowns/SearchableDropdown";


const UserVerificationKYC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { blocked, loading } = useBlockIp();
  
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
        setSelectedCountry(item.label);
        setIsOpen(false);
      }}
      dropdownOptionsCount={arr.length}
      key={`sentry-item-${i}`}
      extraClasses={"hover:!bg-velvetBlack"}
    >
      {item.label}
    </SearchableDropdownItem>
  ));

  const isBlocked = () => blocked || selectedCountry === "United States";
  
  const isInvalidCountry = () => { 
    if (isBlocked() || loading) {
      return true;
    }
    if (listOfCountries.filter(item => item.label === selectedCountry).length === 0) {
      return true;
    }
    return false;
  }
  
  return (
    <div className="max-w-[337px]">
      <SearchableDropdown
        dropdownOptionsCount={countries.length}
        isOpen={isOpen}
        selectedValue={selectedCountry}
        selectedValueRender={selectedCountry}
        setSelectedValue={setSelectedCountry}
        setIsOpen={setIsOpen}
        getDropdownItems={() => countries}
        extraClasses={{
          dropdown: "my-4 max-w-[337px]",
          dropdownOptions: "max-w-[340px]",
        }}
        isInvalid={isBlocked()}
      />
      {isBlocked() && <span className="block text-lg font-medium text-[#F76808]">{"KYC is not available for the selected country"}</span>}
      <PrimaryButton
        isDisabled={isInvalidCountry()}
        onClick={onClickHelper}
        btnText={"Continue"}
        className="flex items-center justify-center group uppercase my-2 w-[337px] text-xl global-clip-btn disabled:!text-elementalGrey"
        icon={<ExternalLinkIcon extraClasses={{svgClasses: "mb-[3px] ml-[5px]", pathClasses: `${isInvalidCountry() ? "!fill-elementalGrey" : "!fill-white" } group-hover:!fill-current duration-200 ease-in` }} />}
      />
    </div>
  );
};

export default UserVerificationKYC;
