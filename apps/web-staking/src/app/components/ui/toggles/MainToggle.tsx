"use client";
import { PrimaryButton } from "../buttons";

interface MainToggleProps {
  firstBtnText: string;
  secondBtnText: string;
  showTableKeys: boolean;
  onToogleShowKeys: (showKeys: boolean) => void;
  customClass?: string;
}

const MainToggle = ({firstBtnText, secondBtnText, showTableKeys, onToogleShowKeys, customClass}: MainToggleProps) => {

  return (
    <div className="flex gap-0.5 p-1 bg-[#272123] global-clip-path">
      <PrimaryButton
        onClick={() => onToogleShowKeys(false)}
        btnText={firstBtnText}
        className={`${
          showTableKeys && "!bg-[#272123] !hover:bg-[#272123] !text-americanSilver"
        } !font-semibold ${customClass}`}
        size="sm"
      />
      <PrimaryButton
        onClick={() => onToogleShowKeys(true)}
        btnText={secondBtnText}
        className={`${
          !showTableKeys && "!bg-[#272123] !hover:bg-[#272123] !text-americanSilver"
        } !font-semibold ${customClass}`}
        size="sm"
      />
    </div>
  );
};

export default MainToggle;
