import React from "react";
import { Avatar } from "@nextui-org/react";
import MainTitle from "../titles/MainTitle";
import PoolCapacity from "./PoolCapacity";
import { PoolInfo, TierInfo } from "@/types/Pool";
import Link from "next/link";
import { getCurrentTierByStaking } from "../staking/utils";
import { iconType } from "../dashboard/constants/constants";
import { BaseCallout } from "@/app/components/ui";
import Image from "next/image";

interface PoolOverViewCardProps {
  poolInfo: PoolInfo,
  tiers: Array<TierInfo & { icon?: iconType }>
}

const PoolOverViewCard = ({ poolInfo, tiers }: PoolOverViewCardProps) => {
  const currentTier = getCurrentTierByStaking(poolInfo.totalStakedAmount, tiers);
  return (
    <div
      className={`my-pools-card mt-[15px] relative md:hover:top-[-7px] top-0 duration-100 ease-linear w-full h-full md:max-w-[338px] max-w-[355px]`}>
      <BaseCallout
        extraClasses={{
          calloutWrapper: "w-full md:max-w-[338px] max-w-[355px] h-[328px] !py-0 !px-0",
          calloutFront: "!py-0 !px-0"
        }}
        withOutSpecificStyles
      >
        <div className="w-full h-full group bg-[#201C1C] hover:bg-chromaphobicBlack duration-200 easy-in">
          <Link href={`/pool/${poolInfo.address}/summary`}>
            <div className="flex flex-col justify-between h-full">
              <div className="px-[17px] pt-5">
                <div className="flex justify-between">
                  <Avatar src={poolInfo.meta.logo} className="w-[91px] h-[91px] mb-4" />
                  <span>{currentTier && <Image src={currentTier.label!} alt="Avatar" />}</span>
                </div>
                <MainTitle
                  title={poolInfo.meta.name}
                  classNames="!text-3xl !font-bold break-words !mb-0"
                />
              </div>
              <div className="flex px-[17px] gap-[20px]">
                <div>
                  <span className="block text-xl font-semibold text-white">{poolInfo.ownerShare}%</span>
                  <span className="block text-lg font-medium text-elementalGrey">Owner split</span>
                </div>
                <div>
                  <span className="block text-xl font-semibold text-white">{poolInfo.stakedBucketShare}%</span>
                  <span className="block text-lg font-medium text-elementalGrey">esXAI split</span>
                </div>
                <div>
                  <span className="block text-xl font-semibold text-white">{poolInfo.keyBucketShare}%</span>
                  <span className="block text-lg font-medium text-elementalGrey">Key split</span>
                </div>
              </div>
              <PoolCapacity pool={poolInfo} />
            </div>
          </Link>
        </div>
      </BaseCallout>
    </div>
  );

};

export default PoolOverViewCard;
