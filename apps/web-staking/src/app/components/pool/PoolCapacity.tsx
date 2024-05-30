import { formatCurrencyCompact, formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";
import { PoolInfo } from "@/types/Pool";
import { Progress } from "@nextui-org/react";

const PoolCapacity = ({ pool }: { pool: PoolInfo }) => {
  return (
    <div className="pt-4 pb-[26px] px-[17px] w-full border-t-1 border-[#2A2828] bg-[#2A2828] group-hover:bg-darkRoom duration-200 easy-in">
      <div className="flex gap-4 justify-between text-graphiteGray text-sm ">
        <div className="w-full max-w-[50%]">
          <span className="text-elementalGrey text-lg font-medium mb-2">
            {formatCurrencyCompact.format(pool.totalStakedAmount)}/{formatCurrencyCompact.format(pool.maxStakedAmount)} esXAI
          </span>
          <div className="w-full max-w-[101px]">
            <Progress
              size="sm"
              radius="none"
              aria-labelledby="progress"
              value={(pool.totalStakedAmount / pool.maxStakedAmount) * 100 ?? 0}
              classNames={{
                indicator: "bg-white "
              }}
            />
          </div>
        </div>
        <div className="w-full max-w-[50%]">
          <span className="justify-self-start text-elementalGrey text-lg font-medium">
            {formatCurrencyNoDecimals.format(pool.keyCount)}/{formatCurrencyNoDecimals.format(pool.maxKeyCount!)} keys
          </span>
          <div className="w-full max-w-[104px]">
            <Progress
              size="sm"
              radius="none"
              aria-labelledby="progress"
              value={(pool.keyCount / pool.maxKeyCount!) * 100 ?? 0}
              classNames={{
                indicator: "bg-white "
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolCapacity;
