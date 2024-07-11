import { Avatar, Progress } from "@nextui-org/react";
import { PoolInfo, TierInfo } from "@/types/Pool";
import { iconType } from "../dashboard/constants/constants";
import { HelpIcon, Key, PieChart } from "../icons/IconsComponent";
import { useSearchParams } from "next/navigation";
import { formatCurrencyCompact, formatCurrencyNoDecimals, formatCurrencyWithDecimals, hideDecimals } from "@/app/utils/formatCurrency";
import Link from "next/link";
import moment from "moment";
import Image from "next/image";
import TableTooltip from "../ui/tooltips/TableTooltip";

import { useEffect, useState } from "react";
import { SORT_FIELDS } from "@/app/components/staking/AvailablePoolsTableComponent";
import SortArrowUp from "../../../../../../packages/ui/src/rebrand/icons/SortArrowUp";
import SortArrowDown from "../../../../../../packages/ui/src/rebrand/icons/SortArrowDown";

function OnwerUnstakeInfo({ pool, showTooltipOnClick, tooltipDelay }: { pool: PoolInfo, showTooltipOnClick?: boolean, tooltipDelay?: number }) {
  let content: { title: string, body: string } = { title: "null", body: "no content." };

  if (pool.ownerLatestUnstakeRequestCompletionTime && pool.ownerLatestUnstakeRequestCompletionTime >= Date.now()) {
    content = {
      title: "The pool owner has initiated an unstake request for their genesis key.",
      body: `${moment.duration(pool.ownerLatestUnstakeRequestCompletionTime - Date.now()).humanize()} remaining until genesis key is claimable.`
    }
  } else if (pool.ownerStakedKeys == 0) {
    content = {
      title: "This pool owner has unstaked all of their keys from the pool.",
      body: "They may no longer be operating the keys in this pool and the pool may no longer be generating rewards."
    }
  } else if (pool.ownerStakedKeys == pool.ownerRequestedUnstakeKeyAmount) {
    if (pool.ownerLatestUnstakeRequestCompletionTime) {
      content = {
        title: "This pool owner can unstake all of their keys from the pool at any time.",
        body: "They may no longer be operating the keys in this pool and the pool may no longer be generating rewards."
      }
    } else {
      content = {
        title: "The Pool Owner has initiated an unstake request for all their keys in this pool.",
        body: "Please view the details page for unlock information."
      }
    }
  } else {
    return "";
  }

  return <TableTooltip
      content=""
      extraClasses={{ tooltipContainer: "whitespace-normal sm:left-[-50px] !bg-bananaBoat rounded-none sm:w-[357px] lg:w-[529px] sm:", tooltipText: "" }}
      delay={tooltipDelay}
      showOnClick={showTooltipOnClick}
      isWarning
      contentNode={<div className="">
        <div className=" text-nulnOil text-[17px]">
          <div className="font-bold mb-1">{content.title}</div>
          <div className="font-medium">{content.body}</div>
        </div>
      </div>}
  >
    <div className="lg:ml-2">
      <Key />
    </div>
  </TableTooltip>
}

export function TableRowPool({ pool, tier, customClass }: { pool: PoolInfo, tier: TierInfo & { icon: iconType }, customClass?: string }) {
  moment.relativeTimeThreshold('d', 61);

  return (
      <>
        {/*this TD we show when screen more than MD*/}
        <td className={`lg:whitespace-nowrap sm:hidden lg:block flex sm:h-[75px] lg:h-auto items-center lg:px-7 lg:py-5 sm:p-2 sm:py-2 sm:pr-1 lg:text-base text-white text-left font-bold sm:text-base ${customClass}`}>
          <Link href={`/pool/${pool.address}/summary`} className="w-full flex items-center">
            <div className="flex items-center">
              <Avatar src={pool.meta.logo} className="lg:w-[48px] lg:h-[48px] sm:w-[30px] sm:h-[30px] mr-2" />
              <div className="flex sm:flex-col lg:flex-row lg:items-center sm:items-start">
                <span className="sm:text-[13px] lg:text-[18px]">{pool.meta.name}</span>
                <span className={`lg:hidden uppercase  ${tier?.tierBackgroundColor} ${tier?.gradient ? `${tier?.gradient} text-transparent bg-clip-text` : ""} `}>{tier?.iconText}</span>
              </div>
            </div>

            <OnwerUnstakeInfo pool={pool} tooltipDelay={30000} />

            {(pool.updateSharesTimestamp >= Date.now()) &&
                <TableTooltip
                    content=""
                    extraClasses={{ tooltipContainer: "whitespace-normal !bg-bananaBoat rounded-none sm:w-[357px] lg:w-[529px]", tooltipText: "" }}
                    delay={30000}
                    isWarning
                    contentNode={
                      <div className="">
                        <div className="sm:text-small font-bold text-nulnOil lg:text-[17px]">The pool owner has changed the rewards to allocate {pool.pendingShares[0]}%/{pool.pendingShares[1]}%/{pool.pendingShares[2]}% to Owner/Keys/esXAI</div>
                        <div className="sm:text-small font-medium text-nulnOil lg:text-[17px]">{moment.duration(pool.updateSharesTimestamp - Date.now()).humanize()} remaining until changes take effect.</div>
                      </div>
                    }
                >
                  <div className="mx-2 cursor-pointer sm:mt-2 lg:mt-0">
                    <PieChart />
                  </div>
                </TableTooltip>
            }
          </Link>
        </td>
        {/*this TD we show when screen narrower than MD*/}
        <td className={`lg:whitespace-nowrap lg:hidden sm:block flex sm:h-auto lg:h-auto items-center lg:px-7 lg:py-5 sm:px-2 sm:py-2 sm:pr-1 sm:pl-[17px] lg:text-base text-white text-left font-bold sm:text-xs ${customClass} max-w-[140px]`}>
          <Link href={`/pool/${pool.address}/summary`} className="w-fit h-full flex items-center">
            <div className="flex items-center">
              <Avatar src={pool.meta.logo} className="lg:w-[48px] lg:h-[48px] sm:min-w-[32px] sm:min-h-[32px] mr-2" />
              <div className="flex sm:flex-col lg:flex-row lg:items-center sm:items-start">
                <span className="sm:text-[15px] lg:text-[18px]">{pool.meta.name}</span>
                <div className="flex my-1">

                  <OnwerUnstakeInfo pool={pool} showTooltipOnClick tooltipDelay={5000} />

                  {(pool.updateSharesTimestamp >= Date.now()) &&
                      <TableTooltip
                          content=""
                          extraClasses={{ tooltipContainer: "whitespace-normal sm:left-[-60px] !bg-bananaBoat rounded-none sm:w-[357px] lg:w-[529px]", tooltipText: "" }}
                          delay={5000}
                          showOnClick={true}
                          isWarning
                          contentNode={
                            <div className="">
                              <div className="sm:text-base font-bold text-nulnOil lg:text-[17px]">The pool owner has changed the rewards to allocate {pool.pendingShares[0]}%/{pool.pendingShares[1]}%/{pool.pendingShares[2]}% to Owner/Keys/esXAI</div>
                              <div className="sm:text-base font-medium text-nulnOil lg:text-[17px]">{moment.duration(pool.updateSharesTimestamp - Date.now()).humanize()} remaining until changes take effect.</div>
                            </div>
                          }
                      >
                        <div className=" cursor-pointer sm:ml-2 lg:ml-0">
                          <PieChart />
                        </div>
                      </TableTooltip>
                  }
                </div>
                <span className={`lg:hidden uppercase sm:text-base  ${tier?.tierBackgroundColor} ${tier?.gradient ? `${tier?.gradient} text-transparent bg-clip-text` : ""} `}>{tier?.iconText}</span>
              </div>
            </div>


          </Link>
        </td>
      </>
  );
}

interface TableRowLabelProps {
  tier: TierInfo & { icon: iconType };
  poolAddress?: string;
  fullWidth?: boolean;
  customClass?: string;
}

export function TableRowLabel({ tier, poolAddress, fullWidth, customClass }: TableRowLabelProps) {
  return (
      <td
          className={`lg:whitespace-nowrap text-graphiteGray lg:pr-0 lg:py-3 lg:table-cell sm:hidden ${customClass} ${fullWidth ? "w-full" : ""}`}>
        <Link href={poolAddress ? `/pool/${poolAddress}/summary` : "/staking/unstake"} className="w-fit">
          <div className="flex items-center font-medium">
            {tier && <Image src={tier.label!} alt="" />}
          </div>
        </Link>
      </td>
  );
}

export function TableRowCapacity({
                                   pool,
                                   showTableKeys,
                                   maxKeyPerPool,
                                   customClass,
                                   progressClass
                                 }: {
  pool: PoolInfo;
  showTableKeys: boolean;
  maxKeyPerPool: number;
  customClass?: string;
  progressClass?: string
}) {

  return (
      <>
        <td className={`lg:whitespace-nowrap text-graphiteGray lg:py-4 sm:py-2 text-left ${customClass}`}>
          <Link href={`/pool/${pool.address}/summary`} className="w-full">
            <div className="lg:w-3/4 sm:w-full sm:text-[15px] md:text-[18px] text-white font-medium">
              <div className="flex sm:flex-wrap lg:flex-nowrap justify-start sm:mb-1 sm:hidden lg:table-cell">
                {showTableKeys
                    ? <><span>{formatCurrencyNoDecimals.format(pool.keyCount)}</span>/<span>{formatCurrencyNoDecimals.format(maxKeyPerPool)} keys</span></>
                    : <><span>{hideDecimals(formatCurrencyWithDecimals.format(pool.totalStakedAmount))}</span>/<span>{formatCurrencyNoDecimals.format(pool.maxStakedAmount)} esXAI</span></>}
              </div>
              <div className="flex sm:flex-wrap lg:flex-nowrap justify-start sm:mb-1 sm:table-cell lg:hidden">
                {showTableKeys
                    ? <><span>{formatCurrencyCompact.format(pool.keyCount)}</span>/<span>{formatCurrencyCompact.format(maxKeyPerPool)}</span></>
                    : <><span>{formatCurrencyCompact.format(pool.totalStakedAmount)}</span>/<span>{formatCurrencyCompact.format(pool.maxStakedAmount)}</span></>}
              </div>
              <div className={`w-full sm:max-w-[90%] lg:max-w-[50%] mt-1 ${progressClass}`}>
                <Progress
                    size="sm"
                    radius="none"
                    aria-labelledby="progress"
                    value={
                      showTableKeys
                          ? (pool.keyCount / maxKeyPerPool) * 100 ?? 0
                          : (pool.totalStakedAmount / pool.maxStakedAmount) * 100 ?? 0
                    }
                    classNames={{
                      indicator: "bg-white"
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
                                  pool, showTableKeys, isDisconnected, onClick, customClass
                                }: {
  pool: PoolInfo,
  showTableKeys: boolean
  isDisconnected: boolean
  onClick?: () => void
  customClass?: string
}) {
  return (
      <>
        {/*this TD we show when screen narrower than MD*/}
        <td
            className={`whitespace-nowrap text-white lg:py-4 sm:py-2 sm:pl-2 text-right sm:text-[15px] lg:text-base table-cell md:hidden ${customClass}`}>
          <div className="flex justify-start">
          <span
              className="block text-white font-normal text-[15px] md:font-medium md:text-lg mr-[5px] md:mr-0 ">
            {pool?.ownerShare}%
          </span>
            <span className="block font-medium">
            owner
          </span>
          </div>
          <div className="flex justify-start">
          <span
              className="block text-white font-normal text-[15px] md:font-medium md:text-lg mr-[5px] md:mr-0 ">
            {pool?.keyBucketShare}%
          </span>
            <span className="block font-medium">
            keys
          </span>
          </div>
          <div className="flex justify-start">
          <span
              className="block text-white font-normal text-[15px] md:font-medium md:text-lg mr-[5px] md:mr-0 ">
            {pool?.stakedBucketShare}%
          </span>
            <span className="block font-medium">
            esXAI
          </span>
          </div>
        </td>
        {/**/}
        <td className={`sm:hidden lg:table-cell whitespace-nowrap text-graphiteGray lg:py-4 sm:py-2 text-right sm:text-sm lg:text-base lg:pr-7 ${customClass}`}>
          {isDisconnected ? <div className="flex justify-end"><button onClick={onClick} className="font-bold lg:text-[18px] sm:text-sm text-red sm:hidden lg:block">Connect wallet</button></div> : showTableKeys ?
              <Link
                  href={"staking/stake/[poolAddress]/keys"} as={`staking/stake/${pool.address}/keys`}
                  className="font-bold lg:text-[18px] sm:text-sm text-red sm:hidden lg:block hover:text-white duration-200 ease-in">
                Stake Keys
              </Link>
              :

              <Link
                  href={"staking/stake/[poolAddress]/esXAI"} as={`staking/stake/${pool.address}/esXAI`}
                  className="font-bold lg:text-[18px] sm:text-sm text-red sm:hidden lg:block hover:text-white duration-200 ease-in">
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
                            showTableKeys,
                            setCurrentSort,
                            setCurrentSortOrder,
                            currentSortOrder
                          }: {
  column: { title: string, sortField: string | null };
  index: number;
  showTableKeys: boolean;
  setCurrentSort: (field: string) => void;
  setCurrentSortOrder: (order: number) => void;
  currentSortOrder: number;
}) {

  const [isSorted, setIsSorted] = useState(false);
  const sortFilter = useSearchParams().get("sort") || "";
  const sortOrder = useSearchParams().get("sortOrder") || 1;


  const defineSortField = (index: number) => {
    switch (index) {
      case 0:
        return "name";
      case 2:
        return showTableKeys ? "keyCount" : "totalStakedAmount";
      case 4:
        return !column.sortField ? (showTableKeys ? "keyRewardRate" : "esXaiRewardRate") : "";
      case 6:
        return showTableKeys ? "keyRewardRate" : "esXaiRewardRate";
      default:
        return "";
    }
  }

  const handleClick = () => {

    if (sortFilter === column.sortField || sortFilter === defineSortField(index)) {
      setCurrentSortOrder(Number(sortOrder) === 1 ? -1 : 1);
      return;
    }

    if (column.sortField) {
      setCurrentSort(column.sortField);
      return;
    }

    setCurrentSort(defineSortField(index));
  }


  useEffect(() => {

    if (!sortFilter && defineSortField(index) === SORT_FIELDS.esXaiRewardRate) {
      return setIsSorted(true);

    } else if (!sortFilter) {
      return setIsSorted(false);
    }

    if (column.sortField === sortFilter || defineSortField(index) === sortFilter) {
      return setIsSorted(true);
    }

    setIsSorted(false);

  }, [sortFilter]);

  useEffect(() => {


    if (!sortFilter) {
      setCurrentSort(SORT_FIELDS.tier);

    } else if (sortFilter === SORT_FIELDS.keyRewardRate && !showTableKeys) {
      setCurrentSort(SORT_FIELDS.esXaiRewardRate);

    } else if (sortFilter === SORT_FIELDS.esXaiRewardRate && showTableKeys) {
      setCurrentSort(SORT_FIELDS.keyRewardRate);

    }

  }, [showTableKeys]);

  return (
      <th
          onClick={index !== 7 ? handleClick : () => {
          }}
          scope="col"
          className={`text-left select-none hover:bg-chromaphobicBlack cursor-pointer bg-dynamicBlack font-medium text-elementalGrey border-b border-t border-chromaphobicBlack
        ${index === 0 ? "lg:w-[21%] pl-[17px] lg:pl-7 pr-2 lg:pr-0 text-nowrap lg:text-wrap" : ""}
        ${index === 1 && "lg:table-cell lg:pl-[16px] lg:w-[10%] sm:hidden pr-2"} lg:py-4 sm:py-2 bg-crystalWhite font-medium lg:text-[18px] sm:text-sm
        ${index === 2 ? "sm:w-[15%] lg:w-[20%] lg:pl-[16px]" : ""}
        ${index === 3 && "sm:text-left lg:text-right sm:w-[15%] lg:w-[10%] sm:pl-2 lg:pr-4"} 
        ${index === 4 && "text-right lg:pr-4 sm:text-right sm:pr-[14px] sm:pl-[5px] sm:w-[20%] lg:w-[9%]"} 
        ${index === 5 && "text-right lg:pr-4"}
        ${index === 6 && `text-right sm:pl-2 lg:pl-5 lg:pr-4 ${isSorted ? "lg:w-[11%]" : "lg:w-[10%]"}`}
        ${index === 7 && "text-right sm:pr-2 lg:pr-7"}
        `}
          key={index}
      >
        <div className={`w-full flex h-full items-center justify-end
     ${index === 0 && "!justify-start"}
     ${index === 1 && "!justify-start"}
     ${index === 2 && "!justify-start"}
       `}
        >
          {index === 0 && (
              <span className="cursor-pointer">{column.title}</span>
          )}

          {index === 1 && (
              <div className="flex items-center">
                <span className="mr-2 cursor-pointer">{column.title}</span>
                <TableTooltip
                    extraClasses={{
                      tooltipContainer: "lg:left-auto lg:!right-[-38px] xl:left-[-38px] left-[-38px] pb-[10px]",
                      tooltipText: "mb-4"
                    }}
                    content={`Pool tier is determined by the amount of esXAI staked. The higher the pool tier, the higher the reward probability.`}
                    delay={30000}
                    withCTA={true}
                    onCTAClick={() => {
                      window.open("https://xai-foundation.gitbook.io/xai-network/xai-blockchain/staking-explained/staking-rewards-and-tiers", "_blank");
                    }}
                >
                  <HelpIcon
                      width={14}
                      height={14} />
                </TableTooltip>
              </div>
          )}

          {index === 2 && !showTableKeys && (
              <span className="lg:mr-2">{"esXAI STAKING CAPACITY"}</span>
          )}
          {index === 2 && showTableKeys && (
              <span className="lg:mr-2">{"KEY STAKING CAPACITY"}</span>
          )}

          {index === 3 && (
              <span className="">{column.title}</span>
          )}

          {index === 4 && (
              <span className="sm:hidden lg:block">{column.title}</span>
          )}

          {index === 4 && (
              <div className="flex items-center sm:block lg:hidden text-left indent-3">
                <span className="text-left">{showTableKeys ? "KEY " : "esXAI "}</span>
                <div className="flex w-full items-center lg:hidden justify-end">
                  <div className="mr-1">{"RATE"}</div>
                  <TableTooltip
                      extraClasses={{ tooltipContainer: "lg:left-auto lg:!right-[-400px] xl:left-[-400px] !left-[-340px] pb-[10px] !text-left !py-[15px] !w-[356px]" }}
                      content={showTableKeys ? "Estimated annual rate for staking a key based off of stake and reward breakdown and past 7 days of pool rewards." : "Estimated annual rate for staking esXAI based off of stake and reward breakdown and past 7 days of pool rewards."}
                      delay={30000}
                  >
                    <HelpIcon width={14} height={14} />
                  </TableTooltip>
                </div>
              </div>
          )}

          {index === 5 && (
              <span className="">{column.title}</span>
          )}

          {index === 7 && (
              <span className="justify-self-end text-end">{column.title}</span>
          )}


          {index === 0 ? (
              <div className="flex flex-col items-start whitespace-normal">
                <span className="sm:table-cell lg:hidden mr-1">{"POOL NAME /"}</span>
                <div className="flex w-full items-center lg:hidden">
                  <div className="mr-1">{"TIER"}</div>
                  <TableTooltip
                      extraClasses={{ tooltipContainer: "whitespace-normal lg:left-auto lg:!right-[-38px] xl:left-[-38px] left-[-38px] sm:w-[356px] !text-left !py-[15px]" }}
                      content={`Pool tier is determined by the amount of esXAI staked. The higher the pool tier, the higher the reward probability.`}
                      withCTA={true}
                      delay={15000}
                      showOnClick={true}
                      onCTAClick={() => {
                        window.open("https://xai-foundation.gitbook.io/xai-network/xai-blockchain/staking-explained/staking-rewards-and-tiers", "_blank");
                      }}
                  >
                    <HelpIcon
                        width={14}
                        height={14} />
                  </TableTooltip>
                </div>

              </div>
          ) : (
              ""
          )}



          {/* Tooltip for column Key Rate */}
          {index === 6 ? (
              <div className="flex items-center justify-end">
                <span className="mr-2">{showTableKeys ? "KEY RATE" : "esXAI RATE"}</span>
                <TableTooltip
                    extraClasses={{ tooltipContainer: "lg:left-auto lg:!right-[-400px] xl:left-[-400px] left-[-400px] pb-[10px] !text-left !py-[15px]" }}
                    content={showTableKeys ? "Estimated annual rate for staking a key based off of stake and reward breakdown and past 7 days of pool rewards." : "Estimated annual rate for staking esXAI based off of stake and reward breakdown and past 7 days of pool rewards."}
                    delay={30000}
                >
                  <HelpIcon width={14} height={14} />
                </TableTooltip>
              </div>
          ) : (
              ""
          )}

          {isSorted && (Number(sortOrder) === 1 ? <SortArrowUp extraClasses="xl:block hidden ml-[5px]" /> :
                  <SortArrowDown extraClasses="xl:block hidden ml-[5px]" />
          )}
        </div>

      </th>
  );
}

export function TableHeadStaking({
                                   column,
                                   index
                                 }: {
  column: string;
  index: number;
  showTableKeys: boolean;
}) {
  const searchParams = useSearchParams();
  const showKeys = searchParams.get("showKeys") ? searchParams.get("showKeys") === "true" : false;
  return (
      <th
          scope="col"
          className={`text-left text-elementalGrey lg:py-4 sm:py-2 bg-dynamicBlack border-b border-t border-chromaphobicBlack font-medium lg:text-[18px] sm:text-sm 
      ${index === 0 ? "lg:w-[23%] sm:pl-[17px] lg:pl-7 pr-2 lg:pr-0 text-nowrap lg:text-wrap" : ""} 
      ${index === 1 && "lg:w-[10%] lg:table-cell sm:hidden"}
      ${index === 2 ? "sm:w-[15%] lg:w-[20%]" : ""} 
      ${index === 3 && "text-right sm:pr-[10px] lg:pr-4"} 
      ${index === 4 && "lg:pr-4 sm:text-left lg:text-right sm:px-2 sm:pr-[17px] sm:pl-1 sm:w-[20%] lg:w-[9%]"} 
      ${index === 5 && "text-right text-nowrap lg:pr-4 lg:w-[9%]"}
      ${index === 6 && "text-right sm:pl-2 lg:px-4 text-nowrap lg:w-[9%]"}
      ${index === 7 && "text-right sm:pr-2 lg:px-6 lg:w-[9%]"}
      `}
          key={index}
      >

        {index === 0 && (
            <span className="">{column}</span>
        )}

        {index === 2 && !showKeys && (
            <span className="text-elementalGrey mr-2">{"esXAI STAKING CAPACITY"}</span>
        )}
        {index === 2 && showKeys && (
            <span className="text-elementalGrey mr-2">{"KEY STAKING CAPACITY"}</span>
        )}

        {index === 1 && (
            <div className="flex items-center">
              <span className="text-elementalGrey mr-1">{column}</span>

              <TableTooltip
                  extraClasses={{ tooltipContainer: "lg:left-auto lg:!right-[-38px] xl:left-[-38px] left-[-38px] pb-[10px]", tooltipText: "mb-4" }}
                  content={`Pool tier is determined by the amount of esXAI staked. The higher the pool tier, the higher the reward probability.`}
                  delay={30000}
                  withCTA={true}
                  onCTAClick={() => {
                    window.open("https://xai-foundation.gitbook.io/xai-network/xai-blockchain/staking-explained/staking-rewards-and-tiers", '_blank');
                  }}
              >
                <HelpIcon
                    width={14}
                    height={14} />
              </TableTooltip>
            </div>
        )
        }

        {index === 3 && (
            <span className="text-right">{column}</span>
        )}

        {index === 4 && (
            <span className="sm:hidden lg:block">{column}</span>
        )}

        {index === 4 && (
            <div className="flex items-center sm:block lg:hidden text-left">
              <span className="text-left">{column}</span>
              <div className="flex w-full items-center lg:hidden">
                <div className="mr-1">{"RATE"}</div>
                <TableTooltip
                    extraClasses={{ tooltipContainer: "lg:left-auto lg:!right-[-400px] xl:left-[-400px] !left-[-340px] pb-[10px] !text-left !py-[15px] !w-[356px]" }}
                    content={showKeys ? "Estimated annual rate for staking a key based off of stake and reward breakdown and past 7 days of pool rewards." : "Estimated annual rate for staking esXAI based off of stake and reward breakdown and past 7 days of pool rewards."}
                    delay={30000}
                >
                  <HelpIcon width={14} height={14} />
                </TableTooltip>
              </div>
            </div>
        )}


        {/* Tooltip for column esXAI Rate */}
        {index === 5 && (
            <div className="flex items-center justify-end">
              <span className="text-elementalGrey mr-1">{column}</span>
              <TableTooltip
                  extraClasses={{ tooltipContainer: "lg:left-auto lg:!right-[-400px] xl:left-[-400px] left-[-400px] pb-[10px] text-wrap !text-left !py-[15px]" }}
                  content={"Estimated annual rate for staking esXAI based off of stake and reward breakdown and past 7 days of pool rewards."}
                  delay={30000}
              >
                <HelpIcon width={14} height={14} />
              </TableTooltip>
            </div>
        )}


        {/* Tooltip for column Key Rate */}
        {index === 6 && (

            <div className="flex items-center justify-end">
              <span className="text-elementalGrey mr-1">{column}</span>
              <TableTooltip
                  extraClasses={{ tooltipContainer: "lg:left-auto lg:!right-[-400px] xl:left-[-400px] left-[-400px] pb-[10px] text-wrap !text-left !py-[15px]" }}
                  content={"Estimated annual rate for staking a key based off of stake and reward breakdown and past 7 days of pool rewards."}
                  delay={30000}
              >
                <HelpIcon width={14} height={14} />
              </TableTooltip>
            </div>
        )}

        {index === 7 && (
            <span className="">{column}</span>
        )}

        {index === 0 ? (
            <div className="flex flex-col items-start whitespace-normal">
              <span className="sm:table-cell lg:hidden mr-1">{"POOL NAME /"}</span>
              <div className="flex w-full items-center lg:hidden">
                <div className="mr-1">{"TIER"}</div>
                <TableTooltip
                    extraClasses={{ tooltipContainer: "whitespace-normal lg:left-auto lg:!right-[-38px] xl:left-[-38px] left-[-38px] sm:w-[356px]", tooltipText: "mb-2" }}
                    content={`Pool tier is determined by the amount of esXAI staked. The higher the pool tier, the higher the reward probability.`}
                    withCTA={true}
                    delay={15000}
                    showOnClick={true}
                    onCTAClick={() => {
                      window.open("https://xai-foundation.gitbook.io/xai-network/xai-blockchain/staking-explained/staking-rewards-and-tiers", '_blank');
                    }}
                >
                  <HelpIcon
                      width={14}
                      height={14} />
                </TableTooltip>
              </div>
            </div>
        ) : (
            ""
        )}
      </th>
  );
}

export function TableRowStaked({ value, keys, customClass, poolAddress, positionStyles, rateClass }: { value: string, keys?: string, customClass?: string, poolAddress?: string, positionStyles?: string, rateClass?: string }) {
  return (
      <td
          className={`lg:whitespace-nowrap lg:py-4 lg:px-4 lg:text-[18px] sm:pr-[17px] sm:py-2 text-white text-left font-medium sm:text-base ${customClass}`}>
        <Link href={`/pool/${poolAddress}/summary`} className="w-full" >
          <div className={`flex items-end flex-col ${positionStyles}`}>
            <div className={`flex ${rateClass}`}>{value}</div>
            {keys && <div className="w-full lg:hidden sm:table-cell text-base text-right">{keys}</div>}
          </div>
        </Link>
      </td>
  );
}

export function TableRowKeysRewards({
                                      pool,
                                      customClass
                                    }: {
  pool?: PoolInfo;
  value?: string | number;
  totalStaked: number;
  customClass?: string
}) {
  return (
      <td className={`whitespace-nowrap text-graphiteGray lg:px-4 lg:pr-7 py-4 text-right sm:text-sm lg:text-base sm:hidden lg:table-cell ${customClass}`}>
        <div className="w-full">
          <div className="flex sm:flex-col lg:flex-row items-center justify-end">
            {pool ?
                <Link href={`/pool/[poolAddress]/summary`} as={`/pool/${pool.address}/summary`}
                      className="font-bold text-[18px] text-red sm:text-sm lg:text-lg hover:text-white duration-200 ease-in">
                  {"Manage"}
                </Link>
                :
                <Link href={`/staking/unstake`} className="font-bold !text-[18px] text-red sm:text-sm lg:text-base hover:text-white duration-200 ease-in">
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
                                   customClass
                                 }: {
  index: number;
  value: string | number;
  tier: TierInfo & { icon: iconType };
  customClass?: string
}) {
  return (
      <td className={`whitespace-nowrap lg:p-4 sm:p-2 sm:pl-[17px] lg:px-7 lg:text-lg text-graphiteGray text-left font-medium sm:text-xs ${customClass}`}>
        <div className="flex items-center text-graphiteGray">
          <Avatar
              name={(index + 1).toString()}
              className="lg:w-[48px] lg:h-[48px] sm:min-w-[32px] sm:min-h-[32px] mr-2 bg-crystalWhite border text-[#BBBBBB] text-base font-medium"
          />
          <div className="flex sm:flex-col lg:flex-row lg:items-center sm:items-start">
            <span className="text-[18px] text-white font-bold">{value}</span>
            <span className={`lg:hidden uppercase text-base font-bold  ${tier?.tierBackgroundColor} ${tier?.gradient ? `${tier?.gradient} text-transparent bg-clip-text` : ""} `}>{tier?.iconText}</span>
          </div>
        </div>
      </td>
  );
}