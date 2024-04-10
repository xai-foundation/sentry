import ProgressComponent from "../progress/Progress";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import { ExternalLinkComponent } from "../links/LinkComponent";
import { getProgressValue } from "../staking/utils";
import { PoolInfo } from "@/types/Pool";

const ListCards = ({ poolInfo }: { poolInfo: PoolInfo }) => {
  const progressValue = getProgressValue(
    poolInfo.totalStakedAmount ?? 0,
    poolInfo.tier
  );

  return (
    <div className="grid lg:grid-flow-col auto-cols-fr gap-4 w-full mb-5">
      <BorderWrapperComponent customStyle="flex flex-col p-5 lg:pb-[100px] sm:pb-[30px] !mb-0">
        <span className="text-graphiteGray mb-2">Total keys staked</span>
        <span className="text-lightBlackDarkWhite lg:text-4xl sm:text-2xl font-medium mb-6">
          {poolInfo.keyCount}/{poolInfo.maxKeyCount} keys
        </span>
        <ProgressComponent
          // TODO get through ssr progressValue={(poolInfo.keyCount / poolInfo.maxKeyCount) * 100}
        />
      </BorderWrapperComponent>
      <BorderWrapperComponent customStyle="flex flex-col p-5 lg:pb-[100px] sm:pb-[30px] !mb-0">
        <span className="text-graphiteGray">Total esXAI staked</span>
        <span
          className={` ${
            poolInfo.maxStakedAmount.toString().length > 9
              ? "lg:text-3xl mt-3"
              : "lg:text-4xl mt-2"
          } text-lightBlackDarkWhite sm:text-2xl font-medium mb-6`}
        >
          {poolInfo.totalStakedAmount}/{poolInfo.maxStakedAmount} esXai
        </span>
        <ProgressComponent
          progressValue={
            (poolInfo.totalStakedAmount / poolInfo.maxStakedAmount) * 100
          }
        />
      </BorderWrapperComponent>
      <BorderWrapperComponent customStyle="flex flex-col p-5 lg:pb-[80px] !mb-0">
        <div className="flex justify-between">
          <span className="text-graphiteGray mb-2">Current tier</span>
          <ExternalLinkComponent link="#" content="Learn more" />
        </div>
        <span
          className={`lg:text-4xl sm:text-2xl font-medium lg:mb-6 sm:mb-3 ${
            poolInfo.tier?.gradient
              ? `bg-gradient-to-t ${poolInfo.tier?.gradient} bg-clip-text text-transparent`
              : `${poolInfo.tier?.tierBackgroundColor}`
          }`}
        >
          {poolInfo.tier?.iconText}
        </span>
        <ProgressComponent progressValue={progressValue} />
        <div className="flex justify-between mt-2">
          <span className="text-graphiteGray mb-2">
            {poolInfo.tier?.nextTierName && poolInfo.tier?.nextTierName}
          </span>
          <span className="text-graphiteGray mb-2">
            {poolInfo.totalStakedAmount}
            {`${
              poolInfo.tier?.nextTierRequirement
                ? `/${poolInfo.tier?.nextTierRequirement}`
                : " esXai"
            }`}
          </span>
        </div>
      </BorderWrapperComponent>
    </div>
  );
};

export default ListCards;
