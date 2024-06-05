import { PoolInfo } from "@/types/Pool";

const KeyRewardsComponent = ({ pool }: { pool: PoolInfo }) => {
  return (
    <>
      <div className="flex w-full justify-between text-graphiteGray mb-1">
        <span className="font-medium">Rewards</span>
        <span>0 esXAI
          {/* TODO calcualte rewards */}
        </span>
      </div>
      <div className="flex w-full justify-between text-graphiteGray">
        <span className="font-medium">Daily key rewards</span>
        <span>{pool.totalStakedAmount ?? 0.0} esXAI</span>
      </div>
    </>
  );
};

export default KeyRewardsComponent;
