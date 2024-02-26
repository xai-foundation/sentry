"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import TotalStakedComponent from "./TotalStakedComponent";
import MainTitle from "../titles/MainTitle";
import AssetComponent from "./AssetComponent";
import PoolComponent from "../overview/PoolComponent";
import { useGetBalanceHooks, useGetTotalStakedHooks } from "@/app/hooks/hooks";

export const StakingComponent = () => {
  const { open } = useWeb3Modal();
  const { address } = useAccount();
  const { totalStaked } = useGetTotalStakedHooks();

  return (
    <div className="flex sm:flex-col sm:items-center lg:items-start px-6 sm:w-full lg:w-[80%]">
      <div className="sm:flex sm:justify-start sm:w-full">
        <MainTitle title={"Staking"} />
      </div>
      <div className="flex sm:flex-col sm:items-center lg:flex-row w-full">
        <TotalStakedComponent
          address={address}
          title={"Total staked esXAI"}
          subTitle={"Available for staking:"}
          onOpen={open}
          btnText={"Stake"}
          totalStaked={totalStaked}
          showProgressBar
          showTier
          unstake
        />
      </div>
      {!address && (
        <div className="flex sm:flex-col sm:items-center lg:flex-row w-full">
          <TotalStakedComponent
            address={address}
            title={"Claimable rewards"}
            onOpen={open}
            btnText={"Claim"}
          />
        </div>
      )}
      <div className="flex sm:flex-col sm:items-center lg:flex-row w-full lg:pr-2">
        <AssetComponent address={address} />
      </div>
      <PoolComponent />
    </div>
  );
};
