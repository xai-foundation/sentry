import { MasterCardIcon, VisaIcon, ETHIcon, SolanaIcon, USDCIcon, SuperVerseIcon } from "@/svgs/AppIcons";

interface CrossmintButtonProps {
    onClick: () => void;
    btnText: string;
    className?: string;
    wrapperClassName?: string;
    isDisabled?: boolean;
    size?: "sm" | "md" | "lg";
    colorStyle?: "primary" | "secondary" | "outline" | "outline-2";
    hoverClassName?: string;
    icon?: React.ReactNode;
}

export const CrossmintButton = ({
                                  onClick,
                                  btnText,
                                  size = "md",
                                  className,
                                  wrapperClassName,
                                  isDisabled,
                                  colorStyle
                              }: CrossmintButtonProps) => {
    const disabledStyles = isDisabled
        ? "!bg-[#2A2828] !text-[#726F6F] text-bold"
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
            case "outline-2":
                return "bg-nulnOil text-hornetSting hover:bg-white hover:text-hornetSting";
            default:
                return "bg-hornetSting text-whisperWhite hover:bg-white hover:text-hornetSting";
        }
    };

    return (
        <div className={`w-full ${(colorStyle === "outline" || colorStyle==='outline-2') && !isDisabled && "p-[1px] bg-hornetSting global-clip-primary-btn border-t-hornetSting"} ${wrapperClassName}`}>
            <button
                className={`rounded-none font-bold ${getSizeStyles()} ${getColorStyles()} duration-200 ease-in global-clip-primary-btn ${className} ${disabledStyles}`}
                type="submit"
                onClick={onClick}
                disabled={isDisabled}
            >
                <div className="flex justify-center items-center gap-2 ml-2">
                    {btnText}
                    <VisaIcon />
                    <MasterCardIcon />
                    <ETHIcon />
                    <SolanaIcon />
                    <USDCIcon />
                    <SuperVerseIcon />
                    +
                </div>
            </button>
        </div>
    );
};
