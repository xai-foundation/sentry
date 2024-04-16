import React from "react";

import {
  Discord,
  Telegram,
  Website,
  X,
} from "@/app/components/icons/IconsComponent";
import { LinkLogoComponent } from "@/app/components/links/LinkComponent";
import { PoolInfo } from "@/types/Pool";

const PoolSocials = ({ poolInfo }: { poolInfo: PoolInfo }) => {
  const toWebLink = (link: string): string => {
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      return "http://" + link;
    }
    return link;
  };
  return (
    <div className="mt-2 flex flex-wrap">
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
  );
};

export default PoolSocials;
