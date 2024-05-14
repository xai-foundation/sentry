import { WalletIcon } from "../icons/IconsComponents";

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
      className={`group bg-hornetSting px-[21px] py-[14px] text-[#EEEEEE] text-[18px] duration-200 ease-in hover:bg-[#FFFFFF] hover:text-[#F30919] ${
        isFullWidth ? "!w-full" : ""
      } 
      ${
        address && "border-1 border-[#E4E4E4] font-normal"
      } global-clip-primary-btn font-semibold ${className}`}
      type="submit"
      onClick={onOpen}
    >
      <div className="flex items-center">
        {address && <WalletIcon />}
        <span className="ml-3">
          {address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : "CONNECT WALLET"}
        </span>
      </div>
    </button>
  );
};
