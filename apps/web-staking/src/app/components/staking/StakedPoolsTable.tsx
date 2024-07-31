import { useState } from "react";
import MainTitle from "../titles/MainTitle";
import {
  TableRowKeysRewards,
  TableRowLabel,
  TableRowPool,
  TableRowStaked,
  TableRowAvatarV1,
  TableHeadStaking,
  TableRowCapacity,
} from "./TableChunksComponents";
import MessageComponent from "./MessageComponent";
import { PoolInfo, TierInfo } from "@/types/Pool";
import { iconType } from "../dashboard/constants/constants";
import { getCurrentTierByStaking } from "./utils";
import { formatCurrencyCompact, formatCurrencyNoDecimals, formatCurrencyWithDecimals, hideDecimals } from "@/app/utils/formatCurrency";
import { formatDailyRewardRate, formatDailyRewardRatePercentage } from "@/app/utils/formatDailyRewardRate";

const POOL_DATA_COLUMNS_STAKED = [
  "POOL NAME",
  "POOL TIER",
  "",
  // "POOL UPTIME",
  "esXAI STAKED",
  "KEYS STAKED",
  "esXAI RATE",
  "KEY RATE",
  "ACTIONS"
] as const;

const POOL_DATA_COLUMNS_STAKED_MOBILE = [
  "",
  "POOL TIER",
  "",
  // "POOL UPTIME",
  "esXAI/KEYS STAKED",
  "esXAI RATE/KEY "
  // "KEYS STAKED",
  // "ACTIONS"
] as const;

const StakedPoolsTable = (
  {
    userPools,
    v1Stake,
    v1MaxStake,
    tiers,
    showTableKeys,
    maxKeyPerPool
  }: {
    userPools: PoolInfo[],
    v1Stake: number,
    v1MaxStake: number,
    tiers?: Array<TierInfo & { icon?: iconType }>
    showTableKeys: boolean;
    maxKeyPerPool: number;
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
      <table className="min-w-full text-base font-light sm:mb-[25px] lg:mb-[50px] bg-nulnOilBackground shadow-default">
        <thead className="sm:hidden lg:table-header-group bg-dynamicBlack">
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
        <thead className="lg:hidden bg-dynamicBlack">
          <tr>
            {POOL_DATA_COLUMNS_STAKED_MOBILE.map((column, index) => {
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
            <tr key={"v1staking"} className={`border-b border-dynamicBlack text-right group`}>
              <TableRowAvatarV1 value="V1 Stake" index={0} tier={getCurrentTierByStaking(Math.min(v1MaxStake, v1Stake), tiers) as TierInfo & { icon: iconType }} customClass="group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" />
              <TableRowLabel
                tier={getCurrentTierByStaking(Math.min(v1MaxStake, v1Stake), tiers) as TierInfo & {
                  icon: iconType
                }} poolAddress={""} customClass="group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in"/>
              <TableRowStaked value="—" positionStyles="!items-start" customClass="group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in"/>
              <TableRowStaked value={`${v1Stake < 0.0001 ? "<0.0001" : formatCurrencyNoDecimals.format(v1Stake)} esXAI`} customClass="group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in lg:pr-4" rateClass="!text-right" />
              <TableRowStaked value="—" customClass="lg:hidden group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" positionStyles="items-end"/>
              <TableRowStaked value="—" customClass="lg:table-cell sm:hidden group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" positionStyles="items-end"/>
             <TableRowStaked value="—" customClass="lg:table-cell sm:hidden group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" positionStyles="items-end"/>
             <TableRowStaked value="—" customClass="lg:table-cell sm:hidden group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" positionStyles="items-end"/>
            <TableRowKeysRewards totalStaked={v1Stake} customClass="group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" />
            </tr>
          }
          {
            userPools.map((pool, index) => {
              return (
                <tr key={index} className={`border-b border-dynamicBlack text-right group`}>
                  <TableRowPool pool={pool} tier={getCurrentTierByStaking(Math.min(pool.totalStakedAmount, pool.maxStakedAmount), tiers) as TierInfo & { icon: iconType }} customClass="lg:pr-2 group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" />
                  <TableRowLabel
                    tier={getCurrentTierByStaking(Math.min(pool.totalStakedAmount, pool.maxStakedAmount), tiers) as TierInfo & {
                      icon: iconType
                    }} poolAddress={pool.address} customClass="group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in"/>
                  <TableRowCapacity pool={pool} showTableKeys={showTableKeys} maxKeyPerPool={maxKeyPerPool} customClass="group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in pl-1 min-w-[90px]" />
                  {/* <TableRowStaked value={"__%"}/> POOL UPTIME */} 
                  <TableRowStaked value={`${pool.userStakedEsXaiAmount ? pool.userStakedEsXaiAmount < 0.0001 ? "<0.0001" : hideDecimals(formatCurrencyWithDecimals.format(pool.userStakedEsXaiAmount)) : 0} esXAI`} poolAddress={pool.address} keys={`${pool.userStakedKeyIds.length} keys`} customClass="lg:pr-4 group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in sm:pr-[5px]" positionStyles="!items-end" rateClass="text-right" />
                  <TableRowStaked value={`${pool.keyCount == 0 ? 0 : formatCurrencyCompact.format(formatDailyRewardRatePercentage(pool.esXaiRewardRate, 2))}%`} keys={`${pool.keyCount == 0 ? 0 : formatCurrencyCompact.format(formatDailyRewardRate(pool.keyRewardRate, 2))} esXAI`} customClass="lg:pr-4 lg:hidden group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" positionStyles="!items-end" />
                  <TableRowStaked value={`${formatCurrencyNoDecimals.format(pool.userStakedKeyIds.length)} keys`} poolAddress={pool.address} customClass="lg:table-cell sm:hidden group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" positionStyles="!items-end"/>
                  <TableRowStaked value={`${pool.keyCount == 0 ? 0 : formatDailyRewardRatePercentage(pool.esXaiRewardRate, 2)}%`}  poolAddress={pool.address} customClass="lg:table-cell sm:hidden group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" positionStyles="!items-end"/>
                  <TableRowStaked value={`${pool.keyCount == 0 ? 0 : formatDailyRewardRate(pool.keyRewardRate, 2)} esXAI`}  poolAddress={pool.address} customClass="lg:table-cell sm:hidden group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" positionStyles="!items-end"/>
                  <TableRowKeysRewards pool={pool} totalStaked={0} customClass="group-hover:bg-dynamicBlack group-hover:bg-opacity-50 duration-100 ease-in" />
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
    <div className="flex flex-col items-baseline w-full sm:pt-[75px] sm:pb-4 sm:px-[17px] lg:px-7 lg:py-5 bg-nulnOilBackground">
      <MainTitle title={"Staked pools"} classNames="lg:text-[30px] sm:text-[24px] font-bold text-white !lg:mb-0 !mb-2 normal-case" />
      <span className="text-elementalGrey text-lg">
        {poolCount} staked pools
      </span>
    </div>
  );
}

export default StakedPoolsTable;
