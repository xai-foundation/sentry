import { Dispatch, SetStateAction, useState } from "react";
import MainTitle from "../titles/MainTitle";
import { ExternalLinkComponent } from "../links/LinkComponent";
import BaseInput, { InputSizes } from "../ui/inputs/BaseInput";
import { BaseCallout } from "../ui";
import { WarningIcon } from "../icons/IconsComponent";

interface DelegateAddressProps {
  ownerAddress: string | undefined;
  delegateAddress: string;
  setDelegateAddress: Dispatch<SetStateAction<string>>;
  error: boolean;
  setError: Dispatch<SetStateAction<boolean>>;
  showErrors?: boolean;
  editStyles?: boolean;
}

const DelegateAddressComponent = ({
  ownerAddress,
  delegateAddress,
  setDelegateAddress,
  error,
  setError,
  showErrors,
  editStyles
}: DelegateAddressProps) => {

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const value = e.target.value;
    setDelegateAddress(value);

    if ( value !== ""&& !value.match(/^(0x)[0-9a-f]{40}$/i)) {
      setErrorMessage("This is not a valid public address.")
      setError(true)
    } else if (ownerAddress === value) {
      setErrorMessage("You cannot delegate to yourself.")
      setError(true)
    } else {
      setError(false);
      setErrorMessage("")
    }
  };

  return (
    <>
    <div className="w-full py-5 px-6 border-b border-chromaphobicBlack bg-nulnOilBackground pb-5 shadow-default">
      <MainTitle
        title="Delegate address"
        classNames="text-[30px] font-bold normal-case !mb-0"
      />
    </div>
      <div className={`w-full pt-5 pb-6 ${editStyles ? "mb-0" : "mb-[30px]"} bg-nulnOilBackground px-6 shadow-default`}>
      <div className="flex sm:flex-col lg:flex-row justify-between">
        <span className="block mb-4 lg:max-w-[70%] text-americanSilver text-lg">
          This field is optional and is used if you want to delegate operator
          control of the keys in your pool to another address you own.
        </span>
        <ExternalLinkComponent
          externalTab
          link="https://xai-foundation.gitbook.io/xai-network"
          content="Learn more"
          customClass="!text-lg !font-bold sm:mb-4 lg:mb-0"
        />
      </div>

      <BaseInput
        name="delegateAddress"
        type="text"
        label=""
        placeholder="Enter delegate address here"
        placeholderColor="placeholder-dugong text-lg"
        value={delegateAddress}
        isInvalid={showErrors && error}
        size={InputSizes.lg}
        onChange={handleChange}
      />

      {showErrors && error && <BaseCallout isWarning extraClasses={{ calloutWrapper: "w-full mt-2 sm:text-base lg:text-lg", calloutFront: "!justify-start" }}>
            <WarningIcon className="mr-2"/>
            {errorMessage}
          </BaseCallout>}
      </div>
    </>
  );
};

export default DelegateAddressComponent;
