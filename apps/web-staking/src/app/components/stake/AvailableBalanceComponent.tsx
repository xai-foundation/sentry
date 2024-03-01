"use client";
import Image from "next/image";
import iconToken from "../icons/tokenicon.png";
import PopoverWindow from "../staking/PopoverWindow";
interface InputRightComponentProps {
  currency: string;
  availableXaiBalance?: number;
  onMaxBtnClick?: () => void;
}
export default function AvailableBalanceComponent({
  currency,
  availableXaiBalance,
  onMaxBtnClick,
}: InputRightComponentProps) {
  return (
    <main className="flex w-full flex-col">
      <div className="flex justify-end items-center">
        <Image src={iconToken} width={32} height={32} alt="token icon" />
        <span className="flex flex-col items-end text-4xl font-semibold ml-2">
          {currency}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="lg:text-[16px] sm:text-[12px] text-lightGrey">
          Available: {`${availableXaiBalance} esXAI`}
          <PopoverWindow
            customClass="cursor-pointer"
            width={17}
            height={15}
            small
          />
          <span
            className="lg:text-[16px] sm:text-[12px] text-red cursor-pointer"
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
