import React, { useState } from "react";

import { PrimaryButton } from "@/app/components/ui";
import {
  listOfCountries,
  listOfPreferableCountries,
} from "../constants/constants";
import { useBlockIp } from "@/app/hooks";
import { Dropdown, DropdownItem } from "./Dropdown";
import ExternalLinkIcon from "../../../../../../packages/ui/src/rebrand/icons/ExternalLinkIcon";

const PoolDropdownComponent = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>("");
  const [selectedCountryValue, setSelectedCountryValue] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { blocked, loading } = useBlockIp();
  
    function onClickHelper() {
		 if (selectedCountry) {
			if (
				selectedCountryValue === "CN" || //China
				selectedCountryValue === "HK" || //Hong Kong
				selectedCountryValue === "MK" || //Macedonia
				selectedCountryValue === "TR" || //Turkey
				selectedCountryValue === "UA" 	 //Ukraine
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

  const countries: JSX.Element[] = listOfCountries.map((item, i, arr) => (
    <DropdownItem
      onClick={() => {
        setSelectedCountry(item.label);
        setIsOpen(false);
        setSelectedCountryValue(item.value);
      }}
      dropdownOptionsCount={arr.length}
      key={`sentry-item-${i}`}
      extraClasses={"hover:!bg-velvetBlack"}
    >
      {item.label}
    </DropdownItem>
  ));

  const preferableCountries = listOfPreferableCountries.map((item, i, arr) => (
    <DropdownItem
      onClick={() => {
        setSelectedCountry(item.label);
        setIsOpen(false);
        setSelectedCountryValue(item.value);
      }}
      dropdownOptionsCount={arr.length}
      key={`sentry-item-${i}`}
      extraClasses={"hover:!bg-velvetBlack"}
    >
      {item.label}
    </DropdownItem>
  ));

  return (
    <div className="max-w-[337px]">
      <Dropdown
        getPreferableItems={() => preferableCountries}
        dropdownOptionsCount={countries.length}
        isOpen={isOpen}
        selectedValue={selectedCountry}
        selectedValueRender={<p>{selectedCountry || `Select your country`}</p>}
        setSelectedValue={setSelectedCountry}
        setIsOpen={setIsOpen}
        getDropdownItems={() => countries}
        extraClasses={{
          dropdown: "my-4 max-w-[337px]",
          dropdownOptions: "max-w-[340px]",
        }}
        isInvalid={blocked || selectedCountryValue === "US"}
      />
      {((selectedCountry && blocked) || selectedCountryValue === "US") && <span className="block text-lg font-medium text-[#F76808]">{"KYC is not available for the selected country"}</span>}
      <PrimaryButton
        isDisabled={blocked || loading || selectedCountryValue === "" || selectedCountryValue === "US"}
        onClick={onClickHelper}
        btnText={"Continue"}
        className="group uppercase my-2 w-[337px] text-xl"
        rightIcon={<ExternalLinkIcon extraClasses={{svgClasses: "mb-[3px]", pathClasses: `${blocked || selectedCountryValue === "" || selectedCountryValue === "US" ? "!fill-darkRoom" : "!fill-white" } group-hover:!fill-hornetSting duration-200 ease-in` }} />}
      />
    </div>
  );
};

export default PoolDropdownComponent;
