import { Avatar } from "@nextui-org/react";
import React from "react";

import { PoolInfo } from "@/types/Pool";

import { PrimaryButton } from "../buttons/ButtonsComponent";
import { Discord, Telegram, Website, X } from "../icons/IconsComponent";
import { LinkLogoComponent } from "../links/LinkComponent";

interface SummaryDescriptionsProps {
  poolInfo: PoolInfo;
  onClaim: () => void;
  transactionLoading: boolean;
}

const SummaryDescriptions = ({
  poolInfo,
  onClaim,
  transactionLoading,
}: SummaryDescriptionsProps) => {
  const toWebLink = (link: string): string => {
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      return "http://" + link;
    }
    return link;
  };

  return (
    <>
      <div className="mt-[20px] flex w-full flex-col justify-between md:mt-[45px] xl:flex-row">
        <div className="order-2 flex items-center md:items-start xl:order-1">
          <Avatar
            src={poolInfo?.meta?.logo}
            className="mr-5 min-w-[80px] min-h-[80px] md:size-[128px]"
          />
          <div>
            <span className="mt-1 text-[26px] font-bold leading-7 text-lightBlackDarkWhite md:text-[32px]">
              {poolInfo?.meta?.name}
            </span>
            <div className="mt-3 max-w-[182px] rounded-2xl border-1 p-1 text-center text-graphiteGray">
              {`${poolInfo?.ownerShare} % Pool Commission`}
            </div>
            <div className="mt-4 flex flex-wrap">
              {poolInfo?.meta?.website && (
                <LinkLogoComponent
                  externalTab
                  link={toWebLink(poolInfo.meta.website)}
                  Icon={Website}
                  customClass="!p-1 mr-4"
                  color="#4A4A4A"
                />
              )}
              {poolInfo?.meta?.discord && (
                <LinkLogoComponent
                  externalTab
                  link={toWebLink(poolInfo.meta.discord)}
                  Icon={Discord}
                  customClass="!p-1 mr-4"
                  color="#4A4A4A"
                />
              )}
              {/* {poolInfo?.meta?.instagram &&
                <LinkLogoComponent
                  link={poolInfo.meta.instagram}
                  Icon={Discord}
                  customClass="!p-1 mr-4"
                />
              } */}
              {/* {poolInfo?.meta?.youtube &&
                <LinkLogoComponent
                  link={poolInfo.meta.youtube}
                  Icon={Discord}
                  customClass="!p-1 mr-4"
                />
              } */}
              {poolInfo?.meta?.twitter && (
                <LinkLogoComponent
                  externalTab
                  link={toWebLink(poolInfo.meta.twitter)}
                  Icon={X}
                  customClass="!p-1 mr-4"
                  color="#4A4A4A"
                />
              )}
              {poolInfo?.meta?.telegram && (
                <LinkLogoComponent
                  externalTab
                  link={toWebLink(poolInfo?.meta?.telegram)}
                  Icon={Telegram}
                  customClass="!p-1 mr-4"
                  color="#4A4A4A"
                />
              )}
              {/* {poolInfo?.meta?.tiktok &&
                <LinkLogoComponent
                  link={poolInfo.meta.tiktok}
                  Icon={Discord}
                  customClass="!p-1 mr-4"
                />
              } */}
            </div>
          </div>
        </div>
        <div className="order-1 mb-6 flex h-[80px] w-full max-w-full items-center justify-between rounded-2xl bg-crystalWhite px-5 py-3 xl:order-2 xl:mb-0 xl:max-w-[355px]">
          <div>
            <span className="block">Pool rewards</span>
            <span className="block text-2xl font-bold text-lightBlackDarkWhite">
              {poolInfo?.userClaimAmount} esXAI
            </span>
          </div>
          <PrimaryButton
            onClick={onClaim}
            isDisabled={transactionLoading || !poolInfo?.userClaimAmount}
            btnText={"Claim"}
            className="disabled:opacity-50"
          />
        </div>
      </div>
      <div className="mt-4 w-full text-graphiteGray">
        {poolInfo?.meta?.description}
      </div>
    </>
  );
};

export default SummaryDescriptions;
