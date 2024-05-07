
interface ConnectionButtonProps {
  onOpen: () => void;
  address: string | undefined;
  size: "sm" | "md" | "lg";
  isFullWidth?: boolean;
}

export const ConnectButton = ({
  onOpen,
  address,
  isFullWidth,
  size = "md",
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
      className={`rounded-none ${getSizeStyles()} global-clip-path bg-hornetSting font-bold text-whisperWhite text-base duration-200 ease-in hover:bg-white hover:text-hornetSting ${
        isFullWidth ? "!w-full" : ""
      } 
      ${
        address &&
        "bg-hornetSting text-lightBlackDarkWhite hover:bg-caparolGrey"
      }`}
      type="submit"
      onClick={() => onOpen()}
    >
      {address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "CONNECT WALLET"}
    </button>
  );
};
