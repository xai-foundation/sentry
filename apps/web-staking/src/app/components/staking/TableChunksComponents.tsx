import { Avatar, Progress, Tooltip } from "@nextui-org/react";
import { ExternalLinkComponent } from "../links/LinkComponent";
import { PoolInfo, TierInfo } from "@/types/Pool";
import { iconType } from "../dashboard/constants/constants";
import { Key, PieChart } from "../icons/IconsComponent";
import { formatCurrencyNoDecimals, formatCurrencyWithDecimals, hideDecimals } from "@/app/utils/formatCurrency";
import Link from "next/link";
import moment from "moment";


function OnwerUnstakeInfo({ pool }: { pool: PoolInfo }) {
  if (pool.ownerLatestUnstakeRequestCompletionTime >= Date.now()) {
    return <Tooltip
      className="bg-[#FFF9ED] border-[#C36522] border"
      content={
        <div className="px-1 py-2">
          <div className="text-small font-bold text-[#C36522]">The pool owner has initiated an unstake request for their genesis key.</div>
          <div className="text-tiny text-[#C36522]">{moment.duration(pool.ownerLatestUnstakeRequestCompletionTime - Date.now()).humanize()} remaining until genesis key is claimable.</div>
        </div>
      }
    >
      <span className="mx-2 cursor-pointer sm:mt-2 lg:mt-0">
        <Key />
      </span>
    </Tooltip>
  }

  if (pool.ownerStakedKeys == 0) {
    return <Tooltip
      className="bg-[#FFF9ED] border-[#C36522] border"
      content={
        <div className="px-1 py-2">
          <div className="text-small font-bold text-[#C36522]">This pool owner has unstaked all of their keys from the pool. They may no longer be operating the keys in this pool and the pool may no longer be generating rewards.</div>
        </div>
      }
    >
      <span className="mx-2 cursor-pointer sm:mt-2 lg:mt-0">
        <Key />
      </span>
    </Tooltip>
  }

  if (pool.ownerStakedKeys == pool.ownerRequestedUnstakeKeyAmount) {
    return <Tooltip
      className="bg-[#FFF9ED] border-[#C36522] border"
      content={
        <div className="px-1 py-2">
          <div className="text-small font-bold text-[#C36522]">This pool owner can unstake all of their keys from the pool at any time. They may no longer be operating the keys in this pool and the pool may no longer be generating rewards.</div>
        </div>
      }
    >
      <span className="mx-2 cursor-pointer sm:mt-2 lg:mt-0">
        <Key />
      </span>
    </Tooltip>
  }

  return "";

}

export function TableRowPool({ pool, tier }: { pool: PoolInfo, tier: TierInfo & { icon: iconType } }) {
  moment.relativeTimeThreshold('d', 61);

  return (
    <td className="lg:whitespace-nowrap flex items-center lg:px-4 lg:py-7 sm:p-2 sm:py-3 lg:text-base text-graphiteGray text-left font-medium sm:text-xs">
      <Link href={`/pool/${pool.address}/summary`} className="w-full flex items-center">
        <div className="flex items-center">
          <Avatar src={pool.meta.logo} className="w-[32px] h-[32px] mr-2" />
          <div className="flex sm:flex-col lg:flex-row lg:items-center sm:items-start">
            <span className="sm:text-[13px] lg:text-base">{pool.meta.name}</span>
            <span className="relative sm:visible lg:w-0 lg:p-0 lg:invisible pr-3 pl-9 py-1 rounded-2xl border mt-1">
              <span className="absolute lg:top-2 left-3 sm:top-1">
                {tier?.icon && tier?.icon({ width: 16, height: 13.5 })}
              </span>
              {tier?.iconText}
            </span>
          </div>
        </div>

        <OnwerUnstakeInfo pool={pool} />

        {(pool.updateSharesTimestamp >= Date.now()) &&
          <Tooltip
            className="bg-[#FFF9ED] border-[#C36522] border"
            content={
              <div className="px-1 py-2">
                <div className="text-small font-bold text-[#C36522]">The pool owner has changed the rewards to allocate {pool.pendingShares[0]}%/{pool.pendingShares[1]}%/{pool.pendingShares[2]}% to Owner/Keys/esXAI</div>
                <div className="text-tiny text-[#C36522]">{moment.duration(pool.updateSharesTimestamp - Date.now()).humanize()} remaining until changes take effect.</div>
              </div>
            }
          >
            <span className="mx-2 cursor-pointer sm:mt-2 lg:mt-0">
              <PieChart />
            </span>
          </Tooltip>
        }
      </Link>
    </td>
  );
}

interface TableRowLabelProps {
  tier: TierInfo & { icon: iconType };
  poolAddress?: string;
  fullWidth?: boolean;
}

export function TableRowLabel({ tier, poolAddress, fullWidth }: TableRowLabelProps) {
  return (
    <td
      className={`lg:whitespace-nowrap text-graphiteGray lg:pr-12 lg:py-3 lg:table-cell sm:hidden ${fullWidth ? "w-full" : ""}`}>
      <Link href={poolAddress ? `/pool/${poolAddress}/summary` : "/staking/unstake"} className="w-full">
        <div className="flex items-center font-medium">
          <span className="relative pr-3 pl-9 py-1 rounded-2xl border">
            <span className="absolute lg:top-2 left-3 sm:top-1">
              {tier?.icon && tier?.icon({ width: 16, height: 13.5 })}
            </span>
            {tier?.iconText}
          </span>
        </div>
      </Link>
    </td>
  );
}

export function TableRowCapacity({
  pool,
  showTableKeys,
}: {
  pool: PoolInfo;
  showTableKeys: boolean;
  }) {
  
  return (
    <>
      <td className="lg:whitespace-nowrap text-graphiteGray lg:py-4 sm:py-2 text-left">
        <Link href={`/pool/${pool.address}/summary`} className="w-full">
          <div className="lg:w-3/4 sm:w-full sm:text-xs md:text-base">
            <div className="flex sm:flex-wrap lg:flex-nowrap justify-start sm:mb-1">
              {showTableKeys
                ? <><span>{formatCurrencyNoDecimals.format(pool.keyCount)}</span>/<span>{formatCurrencyNoDecimals.format(pool.maxKeyCount)} keys</span></>
                : <><span>{hideDecimals(formatCurrencyWithDecimals.format(pool.totalStakedAmount))}</span>/<span>{formatCurrencyNoDecimals.format(pool.maxStakedAmount)} esXAI</span></>}
            </div>
            <div className="w-full max-w-[50%]">
              <Progress
                size="sm"
                radius="none"
                aria-labelledby="progress"
                value={
                  showTableKeys
                    ? (pool.keyCount / pool.maxKeyCount) * 100 ?? 0
                    : (pool.totalStakedAmount / pool.maxStakedAmount) * 100 ?? 0
                }
                classNames={{
                  indicator: "bg-red"
                }}
              />
            </div>
          </div>
        </Link>
      </td>
    </>
  );
}

export function TableRowRewards({
  pool, showTableKeys
}: {
  pool: PoolInfo,
  showTableKeys: boolean
}) {
  return (
    <>
      {/*these TDs we show only when screen wider than MD breakpoint*/}
      <td
        className="whitespace-nowrap text-graphiteGray lg:py-4 sm:py-2 text-left sm:text-sm lg:text-base pr-0 md:pr-[50px] hidden md:table-cell	">
        <span
          className={`block text-graphiteGray font-normal text-sm md:font-medium md:text-lg mr-[5px] md:mr-0 `}>
          {pool?.ownerShare}%
        </span>
        <span className="block">
          Owner
        </span>
      </td>
      <td
        className="whitespace-nowrap text-graphiteGray lg:py-4 sm:py-2 text-left sm:text-sm lg:text-base pr-0 md:pr-[50px] hidden md:table-cell	">
        <span
          className="block text-graphiteGray font-normal text-sm md:font-medium md:text-lg mr-[5px] md:mr-0 ">
          {pool?.keyBucketShare}%
        </span>
        <span className="block">
          Keys
        </span>
      </td>
      <td
        className="whitespace-nowrap text-graphiteGray lg:py-4 sm:py-2 text-left sm:text-sm lg:text-base hidden md:table-cell	">
        <span
          className="block text-graphiteGray font-normal text-sm md:font-medium md:text-lg mr-[5px] md:mr-0 ">
          {pool?.stakedBucketShare}%
        </span>
        <span className="block">
          esXAI
        </span>
      </td>
      {/**/}

      {/*this TD we show when screen narrower than MD*/}
      <td
        className="whitespace-nowrap text-graphiteGray lg:py-4 sm:py-2 text-left sm:text-sm lg:text-base table-cell md:hidden">
        <div className="flex">
          <span
            className="block text-graphiteGray font-normal text-sm md:font-medium md:text-lg mr-[5px] md:mr-0 ">
            {pool?.ownerShare}%
          </span>
          <span className="block">
            owner
          </span>
        </div>
        <div className="flex">
          <span
            className="block text-graphiteGray font-normal text-sm md:font-medium md:text-lg mr-[5px] md:mr-0 ">
            {pool?.keyBucketShare}%
          </span>
          <span className="block">
            keys
          </span>
        </div>
        <div className="flex">
          <span
            className="block text-graphiteGray font-normal text-sm md:font-medium md:text-lg mr-[5px] md:mr-0 ">
            {pool?.stakedBucketShare}%
          </span>
          <span className="block">
            esXAI
          </span>
        </div>
      </td>
      {/**/}
      <td className="whitespace-nowrap text-graphiteGray lg:py-4 sm:py-2 text-left sm:text-sm lg:text-base lg:pl-[50px]">
        {showTableKeys ?
          <Link
            href={"staking/stake/[poolAddress]/keys"} as={`staking/stake/${pool.address}/keys`}
            className="font-medium lg:text-base sm:text-sm text-red sm:hidden lg:block">
            Stake Keys
          </Link>
          :

          <Link
            href={"staking/stake/[poolAddress]/esXAI"} as={`staking/stake/${pool.address}/esXAI`}
            className="font-medium lg:text-base sm:text-sm text-red sm:hidden lg:block">
            Stake esXAI
          </Link>
        }
      </td>
    </>
  )
    ;
}

export function TableHead({
  column,
  index,
  showTableKeys
}: {
  column: string;
  index: number;
  showTableKeys: boolean;
}) {
  return (
    <th
      colSpan={index === 3 ? 4 : 1}
      scope="col"
      className={`text-left ${index === 1 && "lg:table-cell lg:w-[10%] sm:hidden pr-2 text-nowrap"
        } lg:py-4 sm:py-2 bg-crystalWhite font-medium lg:text-base sm:text-sm
        ${index === 2 ? "w-full lg:w-[45%]" : ""}
        ${index === 0 ? "lg:w-[20%] pl-2 lg:pl-4 pr-2 lg:pr-0 text-nowrap lg:text-wrap" : ""}
        `}
      key={index}
    >
      {index === 2 && !showTableKeys ? (
        <span className="mr-2">{"esXAI staking capacity"}</span>
      ) : (
        <span className="mr-2">{column}</span>
      )}
      {index === 1 ? (
        <ExternalLinkComponent
          externalTab
          link="https://xai-foundation.gitbook.io/xai-network"
          content="Learn more"
          customClass="!text-base"
        />
      ) : (
        ""
      )}
      {index === 0 ? (
        <ExternalLinkComponent
          externalTab
          link="https://xai-foundation.gitbook.io/xai-network"
          content="Learn more"
          customClass="lg:!text-base sm:text-sm sm:block lg:hidden"
        />
      ) : (
        ""
      )}
    </th>
  );
}

export function TableHeadStaking({
  column,
  index,
}: {
  column: string;
  index: number;
  showTableKeys: boolean;
}) {
  return (
    <th
      scope="col"
      className={`text-left lg:py-4 sm:py-2 bg-crystalWhite font-medium lg:text-base sm:text-sm ${index === 1 && "lg:table-cell sm:hidden"
        } ${index === 0 ? "pl-4" : ""}`}
      key={index}
    >
      <span className={`sm:block sm:w-[25%] lg:inline lg:mr-2 ${index === 5 && "sm:hidden lg:block"}`}>{column}</span>
      {index === 1 ? (
        <ExternalLinkComponent
          externalTab
          link="https://xai-foundation.gitbook.io/xai-network"
          content="Learn more"
          customClass="!text-base"
        />
      ) : (
        ""
      )}
      {index === 0 ? (
        <ExternalLinkComponent
          externalTab
          link="https://xai-foundation.gitbook.io/xai-network"
          content="Learn more"
          customClass="lg:!text-base sm:text-sm sm:block lg:hidden"
        />
      ) : (
        ""
      )}
    </th>
  );
}

export function TableRowStaked({ value, customClass, poolAddress }: { value: string, customClass?: string, poolAddress?: string }) {
  return (
    <td
      className={`lg:whitespace-nowrap lg:py-4 lg:text-base text-graphiteGray text-left sm:text-[13px] pr-2 lg:pr-20  ${customClass}`}>
      <Link href={`/pool/${poolAddress}/summary`} className="w-full" >
        <div className="flex items-center">{value}</div>
      </Link>
    </td>
  );
}

export function TableRowKeysRewards({
  pool,
  value,
  totalStaked
}: {
  pool?: PoolInfo;
  value?: string | number;
  totalStaked: number;
}) {
  return (
    <td className="whitespace-nowrap text-graphiteGray lg:px-4 py-4 text-left sm:text-sm lg:text-base">
      <div className="w-full">
        <div className="flex sm:flex-col lg:flex-row items-center justify-between">
          {pool ?
            <Link href={`/pool/[poolAddress]/summary`} as={`/pool/${pool.address}/summary`}
              className="font-medium text-base text-red sm:text-sm lg:text-base">
              {"Manage"}
            </Link>
            :
            <Link href={`/staking/unstake`} className="font-medium text-base text-red sm:text-sm lg:text-base">
              {"Unstake"}
            </Link>
          }
        </div>
      </div>
    </td>
  );
}

export function TableRowAvatarV1({
  index,
  value,
  tier,
}: {
  index: number;
  value: string | number;
  tier: TierInfo & { icon: iconType };
}) {
  return (
    <td className="whitespace-nowrap lg:p-4 sm:p-2 lg:text-base text-graphiteGray text-left font-medium sm:text-xs">
      <div className="flex items-center text-graphiteGray">
        <Avatar
          name={(index + 1).toString()}
          className="w-[32px] h-[32px] mr-2 bg-crystalWhite border text-[#BBBBBB] text-base font-medium"
        />
        <div className="flex sm:flex-col lg:flex-row lg:items-center sm:items-start">
          {value}
          <span className="relative sm:visible lg:w-0 lg:p-0 lg:invisible pr-3 pl-9 py-1 rounded-2xl border mt-1">
            <span className="absolute lg:top-2 left-3 sm:top-1">
              {tier?.icon && tier?.icon({ width: 16, height: 13.5 })}
            </span>
            {tier?.iconText}
          </span>
        </div>
      </div>
    </td>
  );
}