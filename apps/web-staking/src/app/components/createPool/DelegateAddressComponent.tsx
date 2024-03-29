import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PoolInput } from "../input/InputComponent";
import MainTitle from "../titles/MainTitle";
import { ExternalLinkComponent } from "../links/LinkComponent";

interface DelegateAddressProps {
  ownerAddress: string | undefined;
  delegateAddress: string;
  setDelegateAddress: Dispatch<SetStateAction<string>>;
  setErrorSameWallets: Dispatch<SetStateAction<boolean>>;
  error: boolean;
  setError: Dispatch<SetStateAction<boolean>>;
}

const DelegateAddressComponent = ({
  ownerAddress,
  delegateAddress,
  setDelegateAddress,
  setErrorSameWallets,
  error,
  setError,
}: DelegateAddressProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelegateAddress(e.target.value);
    e.target.value.match(/^(0x)[0-9a-f]{40}$/i) || e.target.value === ""
      ? setError(false)
      : setError(true);
  };
  
  useEffect(() => {
    ownerAddress === delegateAddress
      ? setErrorSameWallets(true)
      : setErrorSameWallets(false);
  }, [delegateAddress, ownerAddress, setErrorSameWallets]);

  return (
    <div className="border-t-1 w-full py-5 lg:mb-[50px]">
      <MainTitle
        title="Delegate address"
        classNames="text-xl font-bold !mb-8"
      />
      <div className="flex justify-between">
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
        isInvalid={
          (delegateAddress.length > 0 && error) ||
          ownerAddress === delegateAddress
        }
        errorMessage="This is not a valid public address."
      />
    </div>
  );
};

export default DelegateAddressComponent;
