import { formatCurrencyCompact, formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";
import { PoolInfo } from "@/types/Pool";
import { Progress } from "@nextui-org/react";

const PoolCapacity = ({ pool }: { pool: PoolInfo }) => {
  return (
    <div className="px-5 pt-3 pb-5 w-full">
      <span className="text-graphiteGray font-medium ">Staking capacity</span>
      <div className="grid grid-cols-2 gap-4 text-graphiteGray text-sm mt-3">
        <div>
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
        <div>
          <span className="justify-self-start">
            {formatCurrencyNoDecimals.format(pool.keyCount)}/{formatCurrencyNoDecimals.format(pool.maxKeyCount)} keys
          </span>
          <Progress
            size="sm"
            radius="none"
            aria-labelledby="progress"
            value={(pool.keyCount / pool.maxKeyCount) * 100 ?? 0}
            classNames={{
              indicator: "bg-red",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PoolCapacity;
