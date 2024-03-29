import React from "react";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import { Avatar } from "@nextui-org/react";
import MainTitle from "../titles/MainTitle";
import ListLabel from "./ListLabel";
import KeyRewardsComponent from "./KeyRewardsComponent";
import PoolCapacity from "./PoolCapacity";
import { PoolInfo, TierInfo } from "@/types/Pool";
import Link from "next/link";
import { getCurrentTierByStaking } from "../staking/utils";
import { iconType } from "../dashboard/constants/constants";

const PoolOverViewCard = ({ poolInfo }: { poolInfo: PoolInfo }) => {
  return (
    <BorderWrapperComponent
      customStyle="mr-0 md:mr-4 mb-4 w-[340px]"
    >
      <Link href={`/pool/${poolInfo.address}/summary`}>
        <div className="border-b-1 border-b-light-grey pb-4 p-5">
          <Avatar src={poolInfo.meta.logo} className="w-[64px] h-[64px] mb-4" />
            <MainTitle
              title={poolInfo.meta.name}
              classNames="text-2xl font-medium !mb-4"
            />
          <ListLabel tier={getCurrentTierByStaking(Math.min(poolInfo.totalStakedAmount, poolInfo.maxStakedAmount)) as TierInfo & { icon: iconType }} />
          <KeyRewardsComponent pool={poolInfo} />
        </div>
        <PoolCapacity pool={poolInfo} />
      </Link>
    </BorderWrapperComponent>
  );

};

export default PoolOverViewCard;
