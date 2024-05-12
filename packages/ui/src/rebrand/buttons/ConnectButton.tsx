interface ConnectionButtonProps {
  onOpen: () => void;
  address: string | undefined;
  isFullWidth?: boolean;
  className?: string
}

export const ConnectButton = ({
  onOpen,
  address,
  isFullWidth,
  className
}: ConnectionButtonProps) => {
  return (
    <button
      className={`bg-[#F30919] px-[21px] py-[14px] font-bold text-[#EEEEEE] text-base duration-200 ease-in hover:bg-[#FFFFFF] hover:text-[#F30919] ${
        isFullWidth ? "!w-full" : ""
      } 
      ${
        address &&
        "border-1 border-[#E4E4E4] bg-white text-lightBlackDarkWhite hover:bg-[#E4E4E4]"
      } global-clip-primary-btn ${className}`}
      type="submit"
      onClick={onOpen}
    >
      {address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "CONNECT WALLET"}
    </button>
  );
};
