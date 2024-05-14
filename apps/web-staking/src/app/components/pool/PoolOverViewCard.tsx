import React from "react";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import { Avatar } from "@nextui-org/react";
import MainTitle from "../titles/MainTitle";
import ListLabel from "./ListLabel";
import PoolCapacity from "./PoolCapacity";
import { PoolInfo, TierInfo } from "@/types/Pool";
import Link from "next/link";
import { getCurrentTierByStaking } from "../staking/utils";
import { iconType } from "../dashboard/constants/constants";

const PoolOverViewCard = ({ poolInfo, tiers }: { poolInfo: PoolInfo, tiers: Array<TierInfo & { icon?: iconType }> }) => {
  return (
    <BorderWrapperComponent
      customStyle="mr-0 md:mr-4 mb-4 w-[340px]"
    >
      <Link href={`/pool/${poolInfo.address}/summary`}>
        <div className="flex flex-col justify-between h-full">
          <div className="px-5 pt-5 h-full">
            <Avatar src={poolInfo.meta.logo} className="w-[64px] h-[64px] mb-4" />
            <MainTitle
              title={poolInfo.meta.name}
              classNames="text-2xl font-medium !mb-4 break-words"
            />
          </div>
          <div className="px-5 mb-[30px]">
            <ListLabel
              tier={getCurrentTierByStaking(Math.min(poolInfo.totalStakedAmount, poolInfo.maxStakedAmount), tiers) as TierInfo & {
                icon: iconType
              }} />
          </div>
          <PoolCapacity pool={poolInfo} />
        </div>
      </Link>
    </BorderWrapperComponent>
  );

};

export default PoolOverViewCard;
