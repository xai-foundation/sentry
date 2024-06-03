import React, { useState } from "react";
import BaseCallout from "@/app/components/ui/callouts/BaseCallout";
import { CURRENCY } from "@/app/components/redeem/Constants";
import { RedXaiIcon, WarningIcon } from "@/app/components/icons/IconsComponent";
import PopoverWindow from "../../staking/PopoverWindow";

export enum StakingInputCurrency {
  KEYS = "Keys",
  SENTRY_KEYS = "Sentry Keys",
  SENTRY_KEY = "Sentry Key",
}

interface StakingInputProps {
  value: string;
  label: string;
  currencyLabel: StakingInputCurrency | CURRENCY;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  handleMaxValue?: () => void;
  withIcon?: boolean;
  withTooltip?: boolean;
  withPopover?: boolean;
  availableBalance?: any;
  availableCurrency?: string;
  extraClasses?: {
    calloutWrapper?: string
    calloutFront?: string
    inputWrapper?: string;
    input?: string;
    currency?: string;
    currencyWrapper?: string;
    label?: string;
  };
  error?: {
    message?: string;
    flag?: boolean; // for errors without messages, but with modifications of some UI elements
  };
}

const StakingInput = ({
                        value,
                        label,
                        currencyLabel,
                        onChange,
                        withIcon,
                        availableBalance,
                        availableCurrency,
                        handleMaxValue,
                        extraClasses,
                        error,
                        withTooltip,
                        withPopover,
                        disabled
                      }: StakingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <BaseCallout
      extraClasses={{
        calloutWrapper: `h-[140px] w-full max-w-[456px] ${extraClasses?.calloutWrapper}`,
        calloutFront: extraClasses?.calloutFront
      }}
      withOutSpecificStyles={disabled}
      isFocused={isFocused}
    >
      <div className={`w-full h-full p-[10px] ${extraClasses?.inputWrapper}`}>
        <span className={`block text-xl font-semibold mb-3 ${extraClasses?.label} text-white`}>{label}</span>
        <div className={`flex ${extraClasses?.currencyWrapper}`}>
          <input
            value={value}
            onFocus={() => setIsFocused((prev) => !prev)}
            onBlur={() => setIsFocused((prev) => !prev)}
            disabled={disabled}
            onChange={onChange}
            type="number"
            placeholder="0"
            className={`placeholder:text-white text-white bg-transparent focus:outline-0 text-4xl font-medium w-full max-w-[80%] ${error?.flag && "!text-blazeOrange"} ${error?.message && "!text-blazeOrange"} ${extraClasses?.input}`}
          />
          <div className={`text-4xl font-semibold flex items-center gap-1 ${extraClasses?.currency}`}>
            {withIcon && <span className="mb-[4px] ml-[10px]">{RedXaiIcon({ width: 34, height: 32 })}</span>}
            <span className={`text-white w-max ${!withIcon && "ml-[10px]"}`}>{currencyLabel}</span>
          </div>
        </div>
        <div className="flex flex-col-reverse md:flex-row md:items-center items-end mt-2">
          {error?.message && <div className="flex items-center w-full max-w-max gap-1">
            <span className="block"><WarningIcon width={20} height={18} fill="#F76808" /></span>
            <span className="block w-full text-lg font-medium text-blazeOrange">{error?.message}</span>
          </div>}
          {!!availableBalance &&
            <div
              className={`w-max md:w-full text-elementalGrey text-lg font-medium flex items-center justify-end gap-2`}>
              <span className="block">Available: {availableBalance} {availableCurrency ? availableCurrency : currencyLabel}</span>
              {withPopover && <PopoverWindow
                customClass="cursor-pointer"
                width={13}
                height={13}
              />}
              <span
                className={`block font-bold text-pelati cursor-pointer ${withTooltip && "ml-3"} hover:text-white duration-200 easy-in`}
                onClick={handleMaxValue}
              > 
              Max
            </span>
            </div>
          }
        </div>
      </div>
    </BaseCallout>
  );
};

export default StakingInput;