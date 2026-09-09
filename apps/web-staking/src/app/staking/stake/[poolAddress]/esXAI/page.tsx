import React from "react";
import StakeComponent from "@/app/components/stake/StakeComponent";
import { isPoolBanned } from "@/server/services/Pool.service";
import { Metadata } from "next";

type StakeParams = {
  poolAddress: string;
}

export const metadata: Metadata = {
  title: "Stake esXAI",
  description: "Xai App Stake esXAI"
};

export default async function StakeEsXaiForPool({ params }: { params: Promise<StakeParams> }) {
  const { poolAddress } = await params;

  let isBannedPool: boolean = false;
  try {

    isBannedPool = await isPoolBanned(poolAddress);
  } catch (error) {
    console.error("Failed to load pool", error);
  }

  return (
    <StakeComponent poolAddress={poolAddress} isBannedPool={isBannedPool} />
  );
}