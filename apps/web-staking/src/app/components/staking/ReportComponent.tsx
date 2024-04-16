import { formatCurrency } from "@/app/utils/formatCurrency";
import ProgressComponent from "../progress/Progress";
import PopoverWindow from "./PopoverWindow";
import { iconType } from "@/app/components/dashboard/constants/constants";

interface InfoComponentProps {
  address: string | undefined;
  title: string;
  subTitle?: string;
  currentTier?: {
    tierName: string;
    tierBackgroundColor?: string;
    gradient?: string;
    icon?: iconType;
    iconText?: string;
  };
  showProgressBar?: boolean;
  showTier?: boolean;
  progressValue?: number;
  remainingToTierText?: string;
  totalStaked?: number;
  availableForStaking?: number;
}

const ReportComponent = ({
  address,
  title,
  subTitle,
  currentTier,
  showProgressBar,
  showTier,
  progressValue,
  remainingToTierText,
  totalStaked,
  availableForStaking,
}: InfoComponentProps) => {
  return (
    <div className="flex flex-col">
      <span className="text-graphiteGray text-md sm:text-md mb-1 font-medium">
        {title}
      </span>
      <span className="lg:flex lg:justify-between">
        <span className="text-lightBlackDarkWhite text-4xl lg:flex">
          {address ? `${totalStaked ? formatCurrency.format(totalStaked) : ""} esXAI` : "— esXAI"}
          {currentTier && showTier && (
            <div className="flex items-center ml-1">
              <span className="relative lg:text-sm sm:text-xs font-semibold text-graphiteGray pr-2 pl-6 py-1 rounded-2xl border">
                <span className="absolute lg:top-[8px] left-1.5 sm:top-[5px]">
                  {currentTier.icon &&
                    currentTier.icon({ width: 15, height: 12 })}
                </span>
                {currentTier.iconText}
              </span>
            </div>
          )}
        </span>
        {showTier && (
          <span className="text-graphiteGray mt-1 mr-2 justify-end flex pt-2 sm:mb-1">
            {remainingToTierText}
          </span>
        )}
      </span>
      {showProgressBar && <ProgressComponent progressValue={progressValue} />}
      <span className="text-graphiteGray mr-2 justify-end flex mt-2">
        {address &&
          subTitle &&
          `${subTitle} ${availableForStaking ? formatCurrency.format(availableForStaking) : ""} esXAI`}
        {address && subTitle && <PopoverWindow />}
      </span>
    </div>
  );
};

export default ReportComponent;
