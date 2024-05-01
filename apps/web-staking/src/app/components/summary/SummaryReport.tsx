import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";

const SummaryReport = () => {
  return (
    <BorderWrapperComponent customStyle="flex flex-row sm:flex-wrap lg:flex-nowrap p-6 w-full">
      <div className="flex flex-col mr-10 sm:mb-5 lg:mb-0">
        <span className="text-graphiteGray mb-2">Daily key rewards</span>
        <span className="text-lightBlackDarkWhite text-2xl font-medium">
          1089.4 esXAI
        </span>
      </div>
      <div className="flex flex-col mr-10">
        <span className="text-graphiteGray mb-2">esXAI APR</span>
        <span className="text-lightBlackDarkWhite text-2xl font-medium">
          5.6%
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-graphiteGray mb-2">Pool commission</span>
        <span className="text-lightBlackDarkWhite text-2xl font-medium">
          5.6%
        </span>
      </div>
    </BorderWrapperComponent>
  );
};

export default SummaryReport;
