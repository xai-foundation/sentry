interface OverviewBalanceProps {
  address: string | undefined;
  xaiBalance: number;
}

const XAIComponent = ({ address, xaiBalance }: OverviewBalanceProps) => {
  return (
    <div className={`flex flex-col sm:mr-0 ${address ? "" : ""}py-1`}>
      <span className="text-lightBlackDarkWhite text-4xl font-medium mb-2">
        {address ? `${xaiBalance.toFixed(2)} XAI` : "— XAI"}
      </span>
    </div>
  );
};

export default XAIComponent;
