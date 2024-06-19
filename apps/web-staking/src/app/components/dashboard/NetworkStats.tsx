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
    <section className="w-full ">
      <div
        className="flex w-full flex-col items-start md:flex-row md:justify-between py-[17px] md:px-[25px] px-[17px] bg-nulnOil/75 border-b-1 border-chromaphobicBlack shadow-default">
        <h3 className="md:text-3xl text-2xl text-white font-bold">Network stats</h3>
      </div>
      <div
        className="flex w-full md:gap-x-20 gap-x-10 gap-y-5 items-center md:px-[25px] px-[17px] flex-wrap h-full py-[17px] bg-dynamicBlack shadow-default">
        <div>
          <span className="block text-lg font-medium text-elementalGrey">Total keys staked</span>
          <span className="block text-white text-2xl font-semibold">
              {networkData?.networkTotalStakedKeys || 0} keys
            </span>
        </div>
        <div>
          <span className="block text-lg font-medium text-elementalGrey">Total esXAI staked</span>
          <span className="block text-white text-2xl font-semibold">
              {formatCurrencyNoDecimals.format(totalStakedWithV1)}
            <span className="ml-1">esXAI</span>
            </span>
        </div>
        <div>
          <span className="block text-lg font-medium text-elementalGrey">
            Number of pools
          </span>
          <span className="block text-white text-2xl font-semibold">
            {networkData?.networkPoolsCount || 0} pools
          </span>
        </div>
      </div>
    </section>
  );
};

export default NetworkStats;