import { GAevent } from "@/app/utils/analytics";
import { BaseSpinner } from "@/app/components/ui";
import { ReactNode } from "react";
interface PrimaryButtonProps {
  onClick: () => void;
  btnText: string;
  className?: string;
  wrapperClassName?: string;
  isDisabled?: boolean;
  size?: "sm" | "md" | "lg";
  colorStyle?: "primary" | "secondary" | "outline";
  hoverClassName?: string;
  spinner?: boolean;
  icon?: ReactNode;
}

export const PrimaryButton = ({
  onClick,
  btnText,
  size = "md",
  className,
  isDisabled,
                                wrapperClassName,
                                colorStyle,
                                spinner,
                                icon
}: PrimaryButtonProps) => {
  const disabledStyles = isDisabled
    ? "!bg-[#2A2828] !text-[#433F3F] text-bold"
    : "";

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-[22px] py-[9px] h-[40px]";
      case "md":
        return "px-[22px] py-[14px] h-[54px]";
      case "lg":
        return "px-[22px] py-[19px] h-[64px]";
      default:
        return "px-[22px] py-[14px] h-[54px]";
    }
  };

  const getColorStyles = () => {
    switch (colorStyle) {
      case "primary":
        return "bg-hornetSting text-whisperWhite hover:bg-white hover:text-hornetSting";
      case "secondary":
        return "bg-white text-hornetSting hover:bg-hornetSting hover:text-whisperWhite";
      case "outline":
        return "bg-nulnOil text-hornetSting hover:bg-hornetSting hover:text-whisperWhite";
      default:
        return "bg-hornetSting text-whisperWhite hover:bg-white hover:text-hornetSting";
    }
  };

  return (
    <div
      className={`${colorStyle === "outline" && !isDisabled && `p-[1px] bg-hornetSting global-input-clip-path`} ${wrapperClassName}`}>
      <button
        className={`flex items-center justify-center rounded-none text-[18px] font-bold ${getSizeStyles()} ${getColorStyles()} duration-200 ease-in global-input-clip-path ${className} ${disabledStyles}`}
        type="submit"
        onClick={() => {onClick(), GAevent("buttonClicked", "user_interaction", btnText);}}
        disabled={isDisabled}
      >
        {spinner && <BaseSpinner />}
        {icon && <span className="mr-2">{icon}</span>}
        {btnText}
      </button>
    </div>
  );
};
