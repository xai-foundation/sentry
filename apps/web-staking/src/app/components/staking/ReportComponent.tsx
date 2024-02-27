import ProgressComponent from "../progress/Progress";
import PopoverWindow from "./PopoverWindow";

interface InfoComponentProps {
  address: string | undefined;
  title: string;
  subTitle?: string;
  currentTier?: {
    tierName: string;
    tierBackgroundColor?: string;
    gradient?: string;
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
          {address ? `${totalStaked?.toFixed(2)} esXAI` : "— esXAI"}
          {currentTier && showTier && (
            <div>
              <span
                className={`${
                  currentTier.gradient
                    ? currentTier.gradient
                    : currentTier.tierBackgroundColor
                } px-3 py-1 rounded-2xl text-[10px] text-white align-middle ml-2`}
              >
                {currentTier.tierName}
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
          `${subTitle} ${availableForStaking?.toFixed(2)} esXai`}
        {address && subTitle && <PopoverWindow />}
      </span>
    </div>
  );
};

export default ReportComponent;
