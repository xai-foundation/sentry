import React from "react";
import { formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";
import { INetworkData } from "@/server/services/Pool.service";
import { useGetTotalV1StakedAmount } from "@/app/hooks/hooks";

interface INetworkStats {
  networkData: INetworkData;
}

const NetworkStats = ({
  networkData
}: INetworkStats) => {

  const { totalV1StakeAmount } = useGetTotalV1StakedAmount(); //v1 stake

  const totalStakedWithV1 = networkData?.networkTotalStakedEsXAI ? totalV1StakeAmount + networkData.networkTotalStakedEsXAI : totalV1StakeAmount;

  return (
    <section className="w-full max-w-[928px] px-5 xl:px-0">
      <h3 className="text-lg font-bold mb-4">Network stats</h3>
      <div className="flex w-full gap-x-14 gap-y-5 rounded-2xl bg-crystalWhite items-center px-[21px] flex-wrap h-full py-[20px]">
        <div className="flex">
          <div>
            <span className="block font-bold text-lightBlackDarkWhite sm:text-base lg:text-2xl">
              {networkData?.networkTotalStakedKeys || 0} keys
            </span>
            <span className="block">Total keys staked</span>
          </div>
          <div className="lg:ml-10 sm:ml-5">
            <span className="block font-bold text-lightBlackDarkWhite sm:text-base lg:text-2xl">
              {formatCurrencyNoDecimals.format(totalStakedWithV1)}
              <span className="ml-1">esXAI</span>
            </span>
            <span className="block">Total esXAI staked</span>
          </div>
        </div>
        <div>
          <span className="block font-bold text-lightBlackDarkWhite sm:text-base lg:text-2xl">
            {networkData?.networkPoolsCount || 0} pools
          </span>
          <span className="block">
            Number of pools
          </span>
        </div>
      </div>
    </section>
  );
};

export default NetworkStats;