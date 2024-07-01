"use client";
import PopoverWindow from "../staking/PopoverWindow";
interface InputRightComponentProps {
  availableXaiBalance?: number | string;
  onMaxBtnClick?: () => void;
  keyBalance?: number;
  customClass?: string;
}
export default function AvailableBalanceComponent({
  availableXaiBalance,
  onMaxBtnClick,
  keyBalance,
  customClass
}: InputRightComponentProps) {
  return (
    <div className="flex w-full flex-col px-5 pb-2 pt-0">
      <div className="flex items-center justify-end text-lightGrey sm:text-sm lg:text-base">
        <span>
          Available:{" "}
          {`${keyBalance !== undefined ? keyBalance : availableXaiBalance} ${keyBalance !== undefined ? "keys" : "esXAI"}`}
        </span>
          {!keyBalance && (
            <PopoverWindow
              customClass="cursor-pointer"
              width={13}
              height={13}
            />
          )}
        <span
          className="cursor-pointer text-red ml-1"
          onClick={onMaxBtnClick}
          >
          {" "}
          Max
        </span>
      </div>
    </div>
  );
}
