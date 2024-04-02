"use client";

import StakeComponent from "@/app/components/stake/StakeComponent";
import { useAccount } from "wagmi";

const Stake = () => {
  const { address } = useAccount();
  return (
    <div className="flex w-full flex-col items-center sm:p-2 lg:p-0">
      <StakeComponent title="Stake" address={address} />
    </div>
  );
};

export default Stake;
