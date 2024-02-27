"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { OverviewComponent } from "./overview/OverviewComponent";

export default function Home() {
  const { open } = useWeb3Modal();
  const { address } = useAccount();

  return (
    <main className="flex w-full flex-col items-center lg:px-[150px]">
      <OverviewComponent onOpen={open} address={address} />
    </main>
  );
}
