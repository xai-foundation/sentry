"use client";

import StakeComponent from "@/app/components/stake/StakeComponent";
import { useAccount } from "wagmi";

const Unstake = () => {
  const { address } = useAccount();
  return (
    <div className="flex w-full flex-col items-center sm:p-3 lg:p-0">
      <StakeComponent title="Unstake" address={address} unstake />
    </div>
  );
};

export default Unstake;
