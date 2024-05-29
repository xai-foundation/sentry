import { useState } from "react";
import MainTitle from "../titles/MainTitle";
import {
  TableRowKeysRewards,
  TableRowLabel,
  TableRowPool,
  TableRowStaked,
  TableRowAvatarV1,
  TableHeadStaking,
} from "./TableChunksComponents";
import MessageComponent from "./MessageComponent";
import { PoolInfo, TierInfo } from "@/types/Pool";
import { iconType } from "../dashboard/constants/constants";
import { getCurrentTierByStaking } from "./utils";
import { formatCurrencyNoDecimals, formatCurrencyWithDecimals, hideDecimals } from "@/app/utils/formatCurrency";

const POOL_DATA_COLUMNS_STAKED = [
  "Pool",
  "Tier",
  "esXAI staked",
  "Keys staked",
  ""
] as const;

const StakedPoolsTable = (
  {
    userPools,
    v1Stake,
    v1MaxStake,
    tiers
  }: {
    userPools: PoolInfo[],
    v1Stake: number,
    v1MaxStake: number,
    tiers: Array<TierInfo & { icon?: iconType }>
  }
) => {
  const [showMessage, setShowMessage] = useState(true);

  return (
    <>

      <TableDescription poolCount={userPools.length} />

      {v1Stake > 0 && (
        <MessageComponent
          showMessage={showMessage}
          onClick={() => setShowMessage(false)}
        />
      )}
      <table className="min-w-full text-base font-light mb-[50px]">
        <thead className="border-b">
          <tr>
            {POOL_DATA_COLUMNS_STAKED.map((column, index) => {
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
          {v1Stake > 0 &&
            <tr key={"v1staking"} className={`border-b  text-right`}>
              <TableRowAvatarV1 value="V1 Stake" index={0} tier={getCurrentTierByStaking(Math.min(v1MaxStake, v1Stake), tiers) as TierInfo & { icon: iconType }} />
              <TableRowLabel
                tier={getCurrentTierByStaking(Math.min(v1MaxStake, v1Stake), tiers) as TierInfo & {
                  icon: iconType
                }} poolAddress={""} fullWidth />
              <TableRowStaked value={`${v1Stake < 0.0001 ? "<0.0001" : formatCurrencyNoDecimals.format(v1Stake)} esXAI`} />
              <TableRowStaked value="—" customClass="lg:table-cell" />
              <TableRowKeysRewards totalStaked={v1Stake} />
            </tr>
          }
          {
            userPools.map((pool, index) => {
              return (
                <tr key={index} className={`border-b text-right`}>
                  <TableRowPool pool={pool} tier={getCurrentTierByStaking(Math.min(pool.totalStakedAmount, pool.maxStakedAmount), tiers) as TierInfo & { icon: iconType }} />
                  <TableRowLabel
                    tier={getCurrentTierByStaking(Math.min(pool.totalStakedAmount, pool.maxStakedAmount), tiers) as TierInfo & {
                      icon: iconType
                    }} poolAddress={pool.address} fullWidth />
                  <TableRowStaked value={`${pool.userStakedEsXaiAmount ? pool.userStakedEsXaiAmount < 0.0001 ? "<0.0001" : hideDecimals(formatCurrencyWithDecimals.format(pool.userStakedEsXaiAmount)) : 0} esXAI`} poolAddress={pool.address} />
                  <TableRowStaked value={`${formatCurrencyNoDecimals.format(pool.userStakedKeyIds.length)} keys`} poolAddress={pool.address} />
                  <TableRowKeysRewards pool={pool} totalStaked={0} />
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
