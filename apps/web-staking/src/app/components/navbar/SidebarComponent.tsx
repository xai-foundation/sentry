"use client";

import Link from "next/link";
import React from "react";
import { useAccount } from "wagmi";

import { Discord, GitBook, Telegram, X, Xai } from "../icons/IconsComponent";
import { LinkComponent, LinkLogoComponent } from "../links/LinkComponent";

export default function SidebarComponent() {
  const { chainId } = useAccount();

  return (
    <div className="sticky top-0 flex h-screen w-[245px] flex-col justify-between border-r-1 border-silverMist bg-lightWhiteDarkBlack">
      {/* Add your sidebar content here */}
      <div className="mx-5">
        <Link className="flex items-center px-[20px] py-[10px]" href={chainId ? `/?chainId=${chainId}` : "/"}>
          <span className="pb-[6px]">
            <Xai width={20} height={20} />
          </span>
          <div className="py-2 pl-2 text-lg font-bold">Xai</div>
        </Link>
        <div className="flex flex-col">
          <LinkComponent link={chainId ? `/?chainId=${chainId}` : "/"} content="Dashboard" />
          <LinkComponent
            link={`/staking?chainId=${chainId}`}
            content="Staking"
          />
          <LinkComponent link="/redeem" content="Redeem" />
          <LinkComponent link="/pool" content="My pools" />
        </div>
      </div>
      <div>
        <div className="mx-5 mb-5">
          <LinkLogoComponent
            externalTab
            link="https://xai-foundation.gitbook.io/xai-network/xai-blockchain/welcome-to-xai"
            content="GitBook"
            Icon={GitBook}
            customClass="mb-[10px]"
          />
          <LinkLogoComponent
            externalTab
            link="https://discord.com/invite/xaigames"
            content="Discord"
            Icon={Discord}
            customClass="mb-[10px]"
          />
          <LinkLogoComponent
            externalTab
            link="https://twitter.com/xai_games"
            content="X"
            Icon={X}
            customClass="mb-[10px]"
          />
          <LinkLogoComponent
            externalTab
            link="https://t.me/XaiSentryNodes"
            content="Telegram"
            Icon={Telegram}
          />
          <LinkComponent
            externalTab
            link="https://xai.games/generalterms"
            content="General Terms"
            customClass="text-sm"
          />
          <LinkComponent
            externalTab
            link="https://xai.games/stakingterms"
            content="Staking Terms"
            customClass="text-sm"
          />
          <LinkComponent
            externalTab
            link="https://xai.games/privacypolicy"
            content="Privacy Policy"
            customClass="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
