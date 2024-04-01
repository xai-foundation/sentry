import { Avatar, Progress, Tooltip } from "@nextui-org/react";
import { ExternalLinkComponent } from "../links/LinkComponent";
import { PoolInfo, TierInfo } from "@/types/Pool";
import { iconType } from "../dashboard/constants/constants";
import Link from "next/link";
import {ErrorCircle, PieChart} from "../icons/IconsComponent";
import { formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";

export function TableRowPool({ pool, tier }: { pool: PoolInfo, tier: TierInfo & { icon: iconType } }) {

  return (
    <td className="lg:whitespace-nowrap flex items-center lg:p-4 sm:p-2 sm:py-3 lg:text-base text-graphiteGray text-left font-medium sm:text-xs">
      <Link href={`/pool/${pool.address}/summary`} className="flex items-center">
        <Avatar src={pool.meta.logo} className="w-[32px] h-[32px] mr-2" />
        <div className="flex sm:flex-col lg:flex-row lg:items-center sm:items-start">
          {pool.meta.name}
          <span className="relative sm:visible lg:w-0 lg:p-0 lg:invisible pr-3 pl-9 py-1 rounded-2xl border mt-1">
            <span className="absolute lg:top-2 left-3 sm:top-1">
              {tier?.icon && tier?.icon({ width: 16, height: 13.5 })}
            </span>
            {pool.tier?.iconText}
          </span>
        </div>
      </Link>
      {(pool.updateSharesTimestamp >= Date.now()) &&
        <Tooltip
	      className="bg-[#FFF9ED] border-[#C36522] border"
          content={
            <div className="px-1 py-2">
              <div className="text-small font-bold text-[#C36522]">The pool owner has changed the rewards to allocate {pool.pendingShares[0]}%/{pool.pendingShares[1]}%/{pool.pendingShares[2]}% to Owner/Keys/esXai</div>
              <div className="text-tiny text-[#C36522]">This change will go into effect on {new Date(pool.updateSharesTimestamp).toISOString().split("T")[0]}</div>
            </div>
          }
        >
          <span className="mx-2 cursor-pointer sm:mt-2 lg:mt-0">
            {/*<ErrorCircle width={17} height={17} />*/}
	          <PieChart/>
          </span>
        </Tooltip>
      }
    </td>
  );
}

export function TableRowLabel({ tier }: { tier: TierInfo & { icon: iconType }; }) {
  return (
    <td className="lg:whitespace-nowrap text-graphiteGray lg:px-4 lg:py-3 lg:table-cell sm:hidden">
      <div className="flex items-center font-medium">
        <span className="relative pr-3 pl-9 py-1 rounded-2xl border">
          <span className="absolute lg:top-2 left-3 sm:top-1">
            {tier?.icon && tier?.icon({ width: 16, height: 13.5 })}
          </span>
          {tier?.iconText}
        </span>
      </div>
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
      <td className="lg:whitespace-nowrap text-graphiteGray lg:p-4 sm:py-2 text-left">
        <div className="lg:w-3/4 sm:w-full sm:text-xs md:text-base">
          <div className="flex sm:flex-wrap lg:flex-nowrap justify-start sm:mb-1">
            {showTableKeys
              ? <><span>{formatCurrencyNoDecimals.format(pool.keyCount)}</span>/<span>{formatCurrencyNoDecimals.format(pool.maxKeyCount)} keys</span></>
              : <><span>{formatCurrencyNoDecimals.format(pool.totalStakedAmount)}</span>/<span>{formatCurrencyNoDecimals.format(pool.maxStakedAmount)} esXAI</span></>}
          </div>
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
              indicator: "bg-red",
            }}
          />
        </div>
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
    <td className="whitespace-nowrap text-graphiteGray lg:px-4 sm:px:2 py-4 text-left sm:text-sm lg:text-base">
      <div className="w-full">

        {showTableKeys ?
          <div className="flex sm:flex-col lg:flex-row items-center justify-between">
            <span className="justify-self-start">
              0 esXAI
              {/* 0 esXAI TODO calculate pool rewards */}
            </span>
            <Link
              href={"staking/stake/[poolAddress]/keys"} as={`staking/stake/${pool.address}/keys`}
              className="font-medium lg:text-base sm:text-sm text-red sm:hidden lg:block">
              Stake Keys
            </Link>
          </div>
          :
          <div className="flex sm:flex-col lg:flex-row items-center justify-between">
            <span className="justify-self-start">
              0 esXAI
              {/* 0 esXAI TODO calculate pool rewards */}
            </span>
            <Link
              href={"staking/stake/[poolAddress]/esXai"} as={`staking/stake/${pool.address}/esXai`}
              className="font-medium lg:text-base sm:text-sm text-red sm:hidden lg:block">
              Stake esXAI
            </Link>
          </div>
        }

      </div>
    </td>
  );
}

export function TableHead({
  column,
  index,
  showTableKeys,
}: {
  column: string;
  index: number;
  showTableKeys: boolean;
}) {
  return (
    <th
      scope="col"
      className={`text-left ${index === 3 && "sm:text-center lg:text-left"} ${index === 1 && "lg:table-cell sm:hidden"
        } w-[25%] lg:p-4 sm:p-2 bg-crystalWhite font-medium lg:text-base sm:text-sm`}
      key={index}
    >
      {index === 2 && !showTableKeys ? (
        <span className="mr-2">{"esXAI staking capacity"}</span>
      ) : (
        <span className="mr-2">{column}</span>
      )}
      {index === 1 ? (
        <ExternalLinkComponent
          link="https://xai-foundation.gitbook.io/xai-network"
          content="Learn more"
          customClass="!text-base"
        />
      ) : (
        ""
      )}
      {index === 0 ? (
        <ExternalLinkComponent
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
      className={`text-left lg:p-4 sm:py-2 bg-crystalWhite font-medium lg:text-base sm:text-sm ${(index === 1 || index === 3) && "lg:table-cell sm:hidden"
        }`}
      key={index}
    >
      <span className={`sm:block sm:w-[25%] lg:inline lg:mr-2 ${index === 5 && "sm:hidden lg:block"}`}>{column}</span>
      {index === 1 ? (
        <ExternalLinkComponent
          link="https://xai-foundation.gitbook.io/xai-network"
          content="Learn more"
          customClass="!text-base"
        />
      ) : (
        ""
      )}
      {index === 0 ? (
        <ExternalLinkComponent
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

export function TableRowStaked({ value, customClass }: { value: string, customClass?: string }) {
  return (
    <td className={`lg:whitespace-nowrap lg:p-4 lg:text-base text-graphiteGray text-left sm:text-xs ${customClass}`}>
      <div className="flex items-center">{value}</div>
    </td>
  );
}

export function TableRowKeysRewards({
  pool,
  value,
}: {
  pool?: PoolInfo;
  value?: string | number;
}) {
  return (
    <td className="whitespace-nowrap text-graphiteGray lg:px-4 py-4 text-left sm:text-sm lg:text-base">
      <div className="w-full">
        <div className="flex sm:flex-col lg:flex-row items-center justify-between">
          <span className="justify-self-start sm:hidden lg:table-cell">
            {pool ? `${formatCurrencyNoDecimals.format(pool.userStakedEsXaiAmount!)} esXAI` : value}
          </span>
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

export function TableRowLabelV1({
  tier,
}: {
  tier: TierInfo & { icon: iconType };
}) {
  return (
    <td className="lg:whitespace-nowrap text-graphiteGray lg:px-4 lg:py-3 sm:hidden lg:table-cell">
      <div className="flex items-center font-medium">
        <span className="relative pr-3 pl-9 py-1 rounded-2xl border">
          <span className="absolute lg:top-2 left-3 sm:top-1">
            {tier?.icon && tier?.icon({ width: 16, height: 13.5 })}
          </span>
          {tier?.iconText}
        </span>
      </div>
    </td>
  );
}
