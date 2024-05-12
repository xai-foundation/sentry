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

export default async function StakeEsXaiForPool({ params }: { params: StakeParams }) {

  let isBannedPool: boolean = false;
  try {

    isBannedPool = await isPoolBanned(params.poolAddress);
  } catch (error) {
    console.error("Failed to load pool", error);
  }

  return (
    <StakeComponent poolAddress={params.poolAddress} isBannedPool={isBannedPool} />
  );
};