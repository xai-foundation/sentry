import React from "react";
import StakeKeysComponent from "@/app/components/stakeKeysComponent.tsx/StakeKeysComponent";

type StakeParams = {
  poolAddress: string;
}

export default function StakeKeysForPool({ params }: { params: StakeParams }) {
  return (
    <StakeKeysComponent poolAddress={params.poolAddress} />
  );
};