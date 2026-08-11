import React from "react";
import StakeKeysComponent from "@/app/components/stakeKeysComponent.tsx/StakeKeysComponent";
import { isPoolBanned } from "@/server/services/Pool.service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stake Keys",
  description: "Xai App Stake Keys"
};

type StakeParams = {
  poolAddress: string;
}

export default async function StakeKeysForPool({ params }: { params: Promise<StakeParams> }) {
  const { poolAddress } = await params;

  let isBannedPool: boolean = false;
  try {

    isBannedPool = await isPoolBanned(poolAddress);
  } catch (error) {
    console.error("Failed to load pool", error);
  }

  return (
    <StakeKeysComponent poolAddress={poolAddress} isBannedPool={isBannedPool} />
  );
}