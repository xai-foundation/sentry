import React, { ElementType } from "react";

import {
  Discord,
  Telegram,
  Website,
  X,
} from "@/app/components/icons/IconsComponent";
import { LinkLogoComponent } from "@/app/components/links/LinkComponent";
import { PoolInfo } from "@/types/Pool";

const PoolSocialIconLink = ({ link, icon }: { link?: string, icon: ElementType<any, keyof JSX.IntrinsicElements> }) => {

  const isValidHttpUrl = (_link: string) => {
    let url;
    try {
      url = new URL(_link);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  return (
    <>
      {(link && isValidHttpUrl(link)) &&
        <LinkLogoComponent
          externalTab
          link={link}
          Icon={icon}
          customClass="!p-1 mr-4"
          color="#4A4A4A"
        />
      }
    </>
  )
}

const PoolSocials = ({ poolInfo }: { poolInfo: PoolInfo }) => {
  const toWebLink = (link?: string): string => {
    if (!link) {
      return ""
    }
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      return "http://" + link;
    }
    return link;
  };
  return (
    <div className="mt-2 flex flex-wrap">
      <PoolSocialIconLink link={toWebLink(poolInfo.meta.discord)} icon={Discord}/>
      <PoolSocialIconLink link={toWebLink(poolInfo.meta.twitter)} icon={X}/>
      <PoolSocialIconLink link={toWebLink(poolInfo.meta.telegram)} icon={Telegram}/>
      <PoolSocialIconLink link={toWebLink(poolInfo.meta.website)} icon={Website}/>
    </div>
  );
};

export default PoolSocials;
