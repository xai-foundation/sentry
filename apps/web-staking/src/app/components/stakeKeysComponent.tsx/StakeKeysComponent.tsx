"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useAccount } from "wagmi";

import { useGetUserPoolInfo } from "@/app/hooks/hooks";
import StakingKeysDetailComponent from "./StakingKeysDetailComponent";

interface StakeProps {
  poolAddress: string;
}

export default function StakeKeysComponent({ poolAddress }: StakeProps) {
  const router = useRouter();
  const { address } = useAccount();
  const searchParams = useSearchParams()
  const { userPool } = useGetUserPoolInfo(poolAddress);
  const unstake = searchParams.get("unstake") === "true";

  return (
    <div className="flex w-full flex-col items-center justify-center sm:px-3 lg:px-[350px]">
      {userPool &&
        <StakingKeysDetailComponent
          userPool={userPool}
          onBack={() => router.back()}
          address={address}
          unstakeKey={unstake}
        />
      }
    </div>
  );
};