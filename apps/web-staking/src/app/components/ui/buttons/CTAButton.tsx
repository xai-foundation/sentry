import { GAevent } from "@/app/utils/analytics";
import { XaiUpsideDown } from "../../icons/IconsComponent";

interface CTAButtonProps {
  onClick: () => void;
  btnText: string;
  className?: string;
  isDisabled?: boolean;
  hoverClassName?: string;
  showIcon?: boolean;
}

export const CTAButton = ({
  onClick,
  btnText,
  className,
  isDisabled,
  showIcon,
}: CTAButtonProps) => {
  const disabledStyles = isDisabled
    ? "!bg-[#2A2828] !text-[#433F3F] text-bold"
    : "";

  return (
    <button
      className={`group rounded-none font-bold px-[22px] py-[14px] bg-hornetSting text-melanzaneBlack duration-200 ease-in hover:bg-white hover:text-hornetSting global-cta-clip-path ${className} ${disabledStyles}`}
      type="submit"
      onClick={() => {
        onClick(), GAevent("buttonClicked", "user_interaction", btnText);
      }}
      disabled={isDisabled}
    >
      <div className="flex items-center">
        {showIcon && <div className="mr-2">{<XaiUpsideDown width={20} height={18}/>}</div>}
        {btnText}
      </div>
    </button>
  );
};
