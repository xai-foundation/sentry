import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PoolInput } from "../input/InputComponent";
import MainTitle from "../titles/MainTitle";
import { ExternalLinkComponent } from "../links/LinkComponent";

interface DelegateAddressProps {
  ownerAddress: string | undefined;
  delegateAddress: string;
  setDelegateAddress: Dispatch<SetStateAction<string>>;
  error: boolean;
  setError: Dispatch<SetStateAction<boolean>>;
  showErrors?: boolean;
}

const DelegateAddressComponent = ({
  ownerAddress,
  delegateAddress,
  setDelegateAddress,
  error,
  setError,
  showErrors
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
    <div className="border-t-1 w-full py-5 mt-[55px] lg:mb-[50px]">
      <div className="w-full py-3">
        <MainTitle
          title="Delegate address"
          classNames="text-xl font-bold !mb-0"
        />
      </div>
      <div className="flex justify-between pt-4">
        <span className="block mb-4 max-w-[70%] text-graphiteGray">
          This field is optional and is used if you want to delegate operator
          control of the keys in your pool to another address you own.
        </span>
        <ExternalLinkComponent
          externalTab
          link="https://xai-foundation.gitbook.io/xai-network"
          content="Learn more"
          customClass="!text-base"
        />
      </div>
      <PoolInput
        name="delegateAddress"
        type="text"
        label=""
        placeholder="Enter delegate address here"
        onChange={handleChange}
        value={delegateAddress}
        isInvalid={showErrors && error}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default DelegateAddressComponent;
