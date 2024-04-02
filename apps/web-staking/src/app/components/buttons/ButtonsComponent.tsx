import { Button } from "@nextui-org/button";
import { BackArrow } from "../icons/IconsComponent";

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
  return (
    <Button
      className={`bg-[#F30919] text-[#EEEEEE] px-[17px] py-[10px] rounded-[8px] hover:bg-[#da1b28] ease-in duration-200 ${className}`}
      type="submit"
      onClick={() => onClick()}
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
  hoverClassName = 'hover:bg-[#da1b28] hover:text-[#EEEEEE] '
}: CustomButtonProps) => {
  return (
    <PrimaryButton
      size={size}
      onClick={onClick}
      btnText={btnText}
      className={`bg-[#EEEEEE] text-[#F30919] px-[20px] py-[18px] rounded-[8px] font-medium ease-in duration-250 ${className} ${hoverClassName}`}
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
          ? "bg-[#F30919] lg:w-[165px] sm:w-[308px] h-[50px] text-[#EEEEEE] px-[20px] py-[18px] rounded-[8px] hover:bg-[#da1b28] ease-in duration-200"
          : `bg-[#F30919] w-[115px] md:w-[165px] text-[#EEEEEE] px-[17px] py-[10px] rounded-[8px] hover:bg-[#da1b28] ease-in duration-200 ${
              isFullWidth ? "w-full" : ""
            }`
      }
      type="submit"
      onClick={() => onOpen()}
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
}: {
  onClick: () => void;
  btnText: string;
  height?: number;
  width?: number;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center hover:bg-crystalWhite hover:border-palePearl border-1 border-transparent hover:rounded-md gap-2 py-1 px-1 cursor-pointer"
    >
      <BackArrow height={height} width={width} />
      <span>{btnText}</span>
    </div>
  );
}
