"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { Discord, GitBook, Telegram, X, XaiIcon } from "../icons/IconsComponent";
import { LegalLink, LinkComponent, LinkLogoComponent } from "../links/LinkComponent";

export default function SidebarComponent() {
  const { chainId } = useAccount();

  const [activePage, setActivePage] = useState(sessionStorage.getItem("activePage") || `/${window?.location?.pathname?.split("/")[1]}`);
  const handleClick = (page: string) => {
    setActivePage(page);
    sessionStorage.setItem("activePage", page);
  }

  useEffect(() => {
    sessionStorage.setItem("activePage", activePage);
  }, []);

  return (
    <div className="sticky bg-transparent top-0 flex h-screen w-[245px] flex-col justify-between">
      {/* Add your sidebar content here */}
      <div>
        <Link
          className="group flex items-center justify-center w-[108px] mb-[60px] h-[108px] bg-hornetSting hover:bg-white duration-200 ease-in"
          href={chainId ? `/?chainId=${chainId}` : "/"}
          onClick={() => handleClick("/")}
        >
          <XaiIcon width={53} height={48} />
        </Link>
        <div className="flex flex-col">
          <LinkComponent
            link={chainId ? `/?chainId=${chainId}` : "/"}
            content="DASHBOARD"
            activePage={activePage}
            onClick={() => handleClick("/")}
          />
          <LinkComponent
            link={`/staking?chainId=${chainId}`}
            urlActivePath="staking"
            content="STAKING"
            activePage={activePage}
            onClick={() => handleClick("/staking")}
          />
          <LinkComponent
            link="/redeem"
            content="REDEEM"
            activePage={activePage}
            onClick={() => handleClick("/redeem")}
          />
          <LinkComponent
            link="/pool"
            urlActivePath="pool"
            activePage={activePage}
            content="MY POOLS"
            onClick={() => handleClick("/pool")}
          />
        </div>
      </div>
      <div>
        <div className="mx-5 mb-5">
          <LinkLogoComponent
            externalTab
            link="https://xai-foundation.gitbook.io/xai-network/xai-blockchain/welcome-to-xai"
            content="GITBOOK"
            Icon={GitBook}
            customClass=""
          />
          <LinkLogoComponent
            externalTab
            link="https://discord.com/invite/xaigames"
            content="DISCORD"
            Icon={Discord}
            customClass=""
          />
          <LinkLogoComponent
            externalTab
            link="https://twitter.com/xai_games"
            content="X"
            Icon={X}
            customClass=""
          />
          <LinkLogoComponent
            externalTab
            link="https://t.me/XaiSentryNodes"
            content="TELEGRAM"
            Icon={Telegram}
            customClass="mb-[15px]"
          />
          <LegalLink
            externalTab
            link="https://xai.games/generalterms"
            content="TERMS OF SERVICE"
            customClass="text-sm"
          />
          <LegalLink
            externalTab
            link="https://xai.games/stakingterms"
            content="STAKING TERMS"
            customClass="text-sm"
          />
          <LegalLink
            externalTab
            link="https://xai.games/privacy-policy/"
            content="PRIVACY POLICY"
            customClass="text-sm mb-[15px]"
          />
          <span className="pl-4 text-slateGray">&copy;2024 XAI</span>
        </div>
      </div>
    </div>
  );
}
