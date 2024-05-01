import { formatCurrencyCompact, formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";
import { PoolInfo } from "@/types/Pool";
import { Progress } from "@nextui-org/react";

const PoolCapacity = ({ pool }: { pool: PoolInfo }) => {
  return (
    <div className="p-5 w-full border-t-1">
      <span className="text-graphiteGray font-medium ">Staking capacity</span>
      <div className="flex gap-4 justify-between text-graphiteGray text-sm mt-3">
        <div className="w-full max-w-[50%]">
          <span>
            {formatCurrencyCompact.format(pool.totalStakedAmount)}/{formatCurrencyCompact.format(pool.maxStakedAmount)} esXAI
          </span>
          <Progress
            size="sm"
            radius="none"
            aria-labelledby="progress"
            value={(pool.totalStakedAmount / pool.maxStakedAmount) * 100 ?? 0}
            classNames={{
              indicator: "bg-red",
            }}
          />
        </div>
        <div className="w-full max-w-[50%]">
          <span className="justify-self-start">
            {formatCurrencyNoDecimals.format(pool.keyCount)}/{formatCurrencyNoDecimals.format(pool.maxKeyCount)} keys
          </span>
          <Progress
            size="sm"
            radius="none"
            aria-labelledby="progress"
            value={(pool.keyCount / pool.maxKeyCount) * 100 ?? 0}
            classNames={{
              indicator: "bg-red"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PoolCapacity;
