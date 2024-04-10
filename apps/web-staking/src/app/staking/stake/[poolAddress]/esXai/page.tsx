import React from "react";
import StakeComponent from "@/app/components/stake/StakeComponent";

type StakeParams = {
  poolAddress: string;
}

export default async function StakeEsXaiForPool({ params }: { params: StakeParams }) {

  return (
    <StakeComponent poolAddress={params.poolAddress} />
  );
};