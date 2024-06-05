import { GAevent } from "@/app/utils/analytics";
import { WalletIcon } from "../../icons/IconsComponent";

interface ConnectionButtonProps {
  onOpen: () => void;
  address: string | undefined;
  size: "sm" | "md" | "lg";
  isFullWidth?: boolean;
  extraClasses?: string;
}

export const ConnectButton = ({
  onOpen,
  address,
  isFullWidth,
  size = "md",
                                extraClasses
}: ConnectionButtonProps) => {
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

  return (
    <button
      className={`flex group items-center rounded-none ${getSizeStyles()} global-clip-btn font-bold  bg-hornetSting text-whisperWhite text-[18px] duration-200 ease-in hover:bg-white hover:text-hornetSting ${
        isFullWidth ? "!w-full" : ""
      } 
      ${
        address &&
        "bg-hornetSting text-lightBlackDarkWhite hover:bg-caparolGrey font-normal"
      } ${extraClasses}`}
      type="submit"
      onClick={() => {
        onOpen(),
          GAevent("connectWallet", "user_interaction", "Connect wallet");
      }}
    >
      <div className={`w-full flex items-center gap-[12px] `}>
        {address && <WalletIcon />}
        <span className={`w-full ${address ? "font-semibold" : "font-bold"}`}>
          {address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : "CONNECT WALLET"}
        </span>
      </div>
    </button>
  );
};
