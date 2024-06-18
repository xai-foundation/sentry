import { Button } from "@nextui-org/button";
import { BackArrow } from "../icons/IconsComponent";
import { GAevent } from "@/app/utils/analytics";

interface CustomButtonProps {
  onClick: () => void;
  btnText: string;
  className?: string;
  isDisabled?: boolean;
  size?: string;
  hoverClassName?: string;
}

export const PrimaryButton = ({
  onClick,
  btnText,
  className,
  isDisabled,
}: CustomButtonProps) => {
  const disabledStyles = isDisabled ? "!bg-[#2A2828] text-[#433F3F] text-bold" : "";
  return (
    <Button
      className={`font-bold bg-[#F30919] px-[17px] py-[10px] text-[#EEEEEE] duration-200 ease-in hover:bg-[#FFFFFF] hover:text-[#F30919] ${className} ${disabledStyles}`}
      type="submit"
      onClick={() => { onClick(), GAevent('buttonClicked', 'user_interaction', btnText) }}
      disabled={isDisabled}
    >
      {btnText}
    </Button>
  );
};

export const SecondaryButton = ({
  onClick,
  btnText,
  className,
  size,
  hoverClassName = "hover:bg-[#da1b28] hover:text-[#EEEEEE] ",
}: CustomButtonProps) => {
  return (
    <PrimaryButton
      size={size}
      onClick={onClick}
      btnText={btnText}
      className={`bg-[#EEEEEE] px-[20px] py-[18px] font-medium text-[#F30919] duration-250 ease-in ${className} ${hoverClassName}`}
    />
  );
};

interface ConnectionButtonProps {
  onOpen: () => void;
  address: string | undefined;
  isFullWidth?: boolean;
  extraClasses?: string;
}

export const ConnectButton = ({
  onOpen,
  address,
  isFullWidth,
                                extraClasses
}: ConnectionButtonProps) => {
  return (
    <Button
      className={`bg-[#F30919] px-[21px] py-[14px] font-bold text-[#EEEEEE] text-base duration-200 ease-in hover:bg-[#FFFFFF] hover:text-[#F30919] ${isFullWidth ? "!w-full" : ""} 
      ${address && "border-1 border-[#E4E4E4] bg-white text-lightBlackDarkWhite hover:bg-[#E4E4E4]"} ${extraClasses}`}
      type="submit"
      onClick={() => { onOpen(), GAevent('connectWallet', 'user_interaction', 'Connect wallet') }}
    >
      {address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "CONNECT WALLET"}
    </Button>
  );
};

export function ButtonBack({
  onClick,
  btnText,
  height = 16,
  width = 16,
  extraClasses,
}: {
  onClick: () => void;
  btnText: string;
  height?: number;
  width?: number;
  extraClasses?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 border-1 border-transparent p-1 hover:text-hornetSting duration-200 easy-in ${extraClasses}`}
    >
      <BackArrow height={height} width={width} />
      <span>{btnText}</span>
    </div>
  );
}
