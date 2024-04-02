import { useState } from "react";
import MainTitle from "../titles/MainTitle";
import {
  TableRowKeysRewards,
  TableRowLabel,
  TableRowLabelV1,
  TableRowPool,
  TableRowStaked,
  TableRowAvatarV1,
  TableHeadStaking,
} from "./TableChunksComponents";
import MessageComponent from "./MessageComponent";
import { PoolInfo, TierInfo } from "@/types/Pool";
import { iconType } from "../dashboard/constants/constants";
import { useGetTotalStakedHooks } from "@/app/hooks/hooks";
import { getCurrentTierByStaking } from "./utils";
import { formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";

const StakedPoolsTable = ({ userPools }: { userPools: PoolInfo[] }) => {
  const [showMessage, setShowMessage] = useState(true);
  const { totalStaked } = useGetTotalStakedHooks();

  const POOL_DATA_COLUMS_STAKED = [
    "Pool",
    "Tier",
    "esXAI staked",
    "Rewards",
    "Keys staked",
    "Key rewards",
  ];

  return (
    <>

      <TableDescription poolCount={userPools.length} />

      {totalStaked > 0 && (
        <MessageComponent
          showMessage={showMessage}
          onClick={() => setShowMessage(false)}
        />
      )}
      <table className="min-w-full text-base font-light mb-[50px]">
        <thead className="border-b">
          <tr>
            {POOL_DATA_COLUMS_STAKED.map((column, index) => {
              return (
                <TableHeadStaking
                  key={index}
                  column={column}
                  index={index}
                  showTableKeys
                />
              );
            })}
          </tr>
        </thead>
        <tbody>
          {totalStaked > 0 &&
            <tr key={"v1staking"} className={`border-b text-right`}>
              <TableRowAvatarV1 value="V1 Stake" index={0} tier={getCurrentTierByStaking(totalStaked) as TierInfo & { icon: iconType }} />
              <TableRowLabelV1
                tier={getCurrentTierByStaking(totalStaked) as TierInfo & { icon: iconType }}
              />
              <TableRowStaked value={`${formatCurrencyNoDecimals.format(totalStaked)} esXAI`} />
              <TableRowStaked value="—" customClass="sm:indent-3 lg:indent-0" />
              <TableRowStaked value="—" customClass="lg:table-cell sm:hidden" />
              <TableRowKeysRewards value="—" />
            </tr>
          }
        </tbody>
        <tbody>
          {
            userPools.map((pool, index) => {
              return (
                <tr key={index} className={`border-b text-right`}>
                  <TableRowPool pool={pool} tier={getCurrentTierByStaking(Math.min(pool.totalStakedAmount, pool.maxStakedAmount)) as TierInfo & { icon: iconType }} />
                  <TableRowLabel tier={getCurrentTierByStaking(Math.min(pool.totalStakedAmount, pool.maxStakedAmount)) as TierInfo & { icon: iconType }} />
                  <TableRowStaked value={`${pool.userStakedEsXaiAmount ? formatCurrencyNoDecimals.format(pool.userStakedEsXaiAmount) : pool.userStakedEsXaiAmount} esXAI`} />
                  <TableRowStaked value={`0 esXAI`} customClass="lg:table-cell sm:hidden" />
                  <TableRowStaked
                    value={`${formatCurrencyNoDecimals.format(pool.userStakedKeyIds.length)} keys`}
                  />
                  <TableRowKeysRewards pool={pool} />
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </>
  );
};

function TableDescription({ poolCount }: { poolCount: number }) {
  return (
    <div className="flex items-baseline">
      <MainTitle title={"Staked Pools"} classNames="text-xl font-bold !mb-8" />
      <span className="ml-3 text-graphiteGray">
        {poolCount} pools
      </span>
    </div>
  );
}

export default StakedPoolsTable;
