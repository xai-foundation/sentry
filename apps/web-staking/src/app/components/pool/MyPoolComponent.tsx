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
import { PrimaryButton } from "../buttons/ButtonsComponent";
import { useRouter } from "next/navigation";

import SkeletonComponents from "../skeletons/SkeletonComponent";
import AgreeModalComponent from "../modal/AgreeModalComponents";
import { useGetTiers } from "@/app/hooks/useGetTiers";

const PoolComponent = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { isApproved } = useGetKYCApproved();
  const { open } = useWeb3Modal();
  const { tiers } = useGetTiers();

  const { userPools, isLoading } = useGetUserInteractedPools();

  return (
    <div className="sm:p-4 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
      <AgreeModalComponent address={address} />
      {!address && <MainTitle title={"My Pools"} classNames="!mb-0" />}
      {address && isApproved ? (
        <>
          <div className="flex justify-between w-full lg:mb-[50px] sm:mb-[30px]">
            <div className="flex items-baseline">
              <MainTitle title={"My Pools"} classNames="!mb-0" />
              <span className="ml-3 text-graphiteGray">
                {userPools.length} pools
              </span>
            </div>
            <div>
              <PrimaryButton
                btnText={"Create new pool"}
                className="font-semibold"
                onClick={() => router.push("/pool/create")}
              />
            </div>
          </div>

          <div className="w-full flex lg:flex-row justify-center lg:justify-start flex-wrap mb-[40px]">

            {userPools.map((pool) => (
              <PoolOverViewCard key={pool.address} poolInfo={pool} tiers={tiers} />
            ))}
            {isLoading &&
              <SkeletonComponents />
            }
          </div>
        </>
      ) : (
        <>
          <NewPoolComponent
            onOpen={open}
            address={address}
            isApproved={isApproved}
          />
        </>
      )}
      <PoolOverviewComponent />
    </div>
  );
};

export default PoolComponent;
