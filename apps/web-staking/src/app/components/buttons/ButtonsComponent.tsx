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
  const disabledStyles = isDisabled ? "!bg-[#F1F1F1] text-[#D4D4D4]" : "";
  return (
    <Button
      className={`rounded-[8px] bg-[#F30919] px-[17px] py-[10px] text-[#EEEEEE] duration-200 ease-in hover:bg-[#da1b28] ${className} ${disabledStyles}`}
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
      className={`rounded-[8px] bg-[#EEEEEE] px-[20px] py-[18px] font-medium text-[#F30919] duration-250 ease-in ${className} ${hoverClassName}`}
    />
  );
};

interface ConnectionButtonProps {
  onOpen: () => void;
  address: string | undefined;
  variant?: string;
  isFullWidth?: boolean;
}

export const ConnectButton = ({
  onOpen,
  address,
  variant,
  isFullWidth,
}: ConnectionButtonProps) => {
  return (
    <Button
      className={
        variant === "overview"
          ? "h-[50px] rounded-[8px] bg-[#F30919] px-[20px] py-[18px] text-[#EEEEEE] duration-200 ease-in hover:bg-[#da1b28] sm:w-[308px] lg:w-[165px]"
          : `w-[115px] rounded-[8px] bg-[#F30919] px-[17px] py-[10px] text-[#EEEEEE] duration-200 ease-in hover:bg-[#da1b28] md:w-[165px] ${isFullWidth ? "!w-full" : ""
          } 
          ${address && "border-1 border-[#E4E4E4] bg-white text-lightBlackDarkWhite hover:bg-[#E4E4E4]"}`
      }
      type="submit"
      onClick={() => { onOpen(), GAevent('connectWallet', 'user_interaction', 'Connect wallet') }}
    >
      {address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "Connect wallet"}
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
      className={`flex cursor-pointer items-center gap-2 border-1 border-transparent p-1 hover:rounded-md hover:border-palePearl hover:bg-crystalWhite ${extraClasses}`}
    >
      <BackArrow height={height} width={width} />
      <span>{btnText}</span>
    </div>
  );
}
