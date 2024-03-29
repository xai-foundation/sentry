"use client";
import Image from "next/image";

import iconToken from "../icons/tokenicon.png";
import PopoverWindow from "../staking/PopoverWindow";
interface InputRightComponentProps {
  currency: string;
  availableXaiBalance?: number;
  onMaxBtnClick?: () => void;
  keyBalance?: number;
  customClass?: string;
}
export default function AvailableBalanceComponent({
  currency,
  availableXaiBalance,
  onMaxBtnClick,
  keyBalance,
  customClass
}: InputRightComponentProps) {
  return (
    <main className="flex w-full flex-col">
      <div className="flex items-center justify-end">
        {!keyBalance && (
          <Image src={iconToken} width={32} height={32} alt="token icon" />
        )}
        <span
          className={`ml-2 flex flex-col items-end text-4xl font-semibold ${customClass}`}
        >
          {currency}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-lightGrey sm:text-[12px] lg:text-[16px]">
          Available:{" "}
          {`${keyBalance !== undefined ? keyBalance : availableXaiBalance} ${keyBalance !== undefined ? "keys" : "esXAI"}`}
          {!keyBalance && (
            <PopoverWindow
              customClass="cursor-pointer"
              width={17}
              height={15}
              small
            />
          )}
          <span
            className="cursor-pointer text-red sm:text-[12px] lg:text-[16px]"
            onClick={onMaxBtnClick}
          >
            {" "}
            Max
          </span>
        </span>
      </div>
    </main>
  );
}
