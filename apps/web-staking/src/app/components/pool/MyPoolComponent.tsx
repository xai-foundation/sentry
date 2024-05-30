"use client";

import MainTitle from "../titles/MainTitle";
import NewPoolComponent from "./NewPoolComponent";
import PoolOverviewComponent from "@/app/components/dashboard/PoolOverviewComponent";
import PoolOverViewCard from "./PoolOverViewCard";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import {
  useGetKYCApproved,
  useGetUserInteractedPools,
} from "@/app/hooks/hooks";
import { useRouter } from "next/navigation";

import AgreeModalComponent from "../modal/AgreeModalComponents";
import { useGetTiers } from "@/app/hooks/useGetTiers";
import React from "react";
import { PrimaryButton } from "@/app/components/ui";
import { PlusIcon } from "@/app/components/icons/IconsComponent";
import MyPoolsSkeleton from "@/app/components/skeletons/MyPoolsSkeleton";

const PoolComponent = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { isApproved } = useGetKYCApproved();
  const { open } = useWeb3Modal();
  const { tiers } = useGetTiers();

  const { userPools, isLoading } = useGetUserInteractedPools();

  return (
    <div className="sm:p-0 py-4 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
      <AgreeModalComponent address={address} />
      <MainTitle title={"My Pools"} classNames="!mb-8 lg:ml-0 ml-[17px]" />
      {address && isApproved ? (
        <>
          {/*<div className="flex justify-between w-full lg:mb-[50px] sm:mb-[30px]">*/}
          {/*  <div className="flex items-baseline">*/}
          {/*    <MainTitle title={"My Pools"} classNames="!mb-8" />*/}
          {/*  </div>*/}
          {/*</div>*/}

          <div className="w-full shadow-default bg-nulnOil/75 my-pools-wrapper">
            {userPools.length > 0 ? <>
                <div
                  className="flex flex-col md:flex-row w-full justify-between md:items-center py-[10px] md:px-[23px] px-[17px] bg-nulnOil/75 border-b-1 border-chromaphobicBlack ">
                  <div className="flex items-end">
                    <h3 className="md:text-3xl text-2xl text-white font-bold">Staked pools</h3>
                    <span className="ml-3 text-elementalGrey text-lg font-medium">
                      {userPools.length} pools
                    </span>
                  </div>
                  <PrimaryButton
                    onClick={() => router.push("/pool/create")}
                    btnText={"Create new pool"}
                    className="!uppercase w-full group md:mt-0 mt-[12px]"
                    icon={PlusIcon({
                      fill: "#fff",
                      stroke: "#fff",
                      pathClassName: "group-hover:fill-hornetSting group-hover:stroke-hornetSting ease-in duration-200"
                    })}
                  />
                </div>
                <div
                  className="w-full flex lg:flex-row justify-center xl:justify-start flex-wrap mb-[40px] gap-[20px] px-[23px]">
                  {userPools.map((pool) => (
                    <>

                      <PoolOverViewCard
                        key={pool.address}
                        poolInfo={pool} tiers={tiers}
                      />
                    </>
                  ))}
                  {isLoading &&
                    <MyPoolsSkeleton />
                  }
                </div>
              </>
              :
              <div className="h-[438px] flex flex-col items-center justify-center">
                <h3 className="md:text-3xl text-2xl font-bold text-white md:mb-5 mb-1">Create a new pool</h3>
                <span
                  className="block text-lg font-medium text-americanSilver mb-5">
                  Let’s get started setting up your pool
                </span>
                <PrimaryButton
                  onClick={() => router.push("/pool/create")}
                  btnText={"Create pool"}
                  className="!uppercase global-double-clip-path-15px group w-[182px]"
                  icon={PlusIcon({
                    fill: "#fff",
                    stroke: "#fff",
                    pathClassName: "group-hover:fill-hornetSting group-hover:stroke-hornetSting ease-in duration-200"
                  })}
                />
              </div>
            }
          </div>
        </>
        ) :
        (
          <>
            <NewPoolComponent
              onOpen={open}
              address={address}
              isApproved={isApproved}
            />
          </>
        )
      }
      <PoolOverviewComponent />
    </div>
  )
    ;
};

export default PoolComponent;
