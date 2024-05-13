import { useWeb3Modal } from "@web3modal/wagmi/react";
import Image from "next/image";
import React from "react";

import { ConnectButton } from "@/app/components/buttons/ButtonsComponent";
import cardBackground from "@/assets/images/white_mesh_thing_.png";
import { formatCurrencyWithDecimals } from "@/app/utils/formatCurrency";

interface DashboardCardProps {
  esXaiBalance: number;
  xaiBalance: number;
  address: string | undefined;
  unstakedKeyCount: number;
}

const DashboardCard = ({
  esXaiBalance,
  xaiBalance,
  address,
                         unstakedKeyCount
}: DashboardCardProps) => {
  const { open } = useWeb3Modal();
  return (
    <>
      {address ? (
        <section
          className="relative w-full max-w-[928px] overflow-hidden rounded-2xl border-1 border-silverMist pt-[21px] shadow-md sm:min-h-[262px] lg:h-[353px]">
          <span className="block pl-[24px]">Tokens</span>
          <span className="dashboard-text-gradient block w-full pl-[24px] sm:text-[24px] lg:text-[40px] xl:text-[54px]">
            {formatCurrencyWithDecimals.format(esXaiBalance)}
            <span className="ml-1">esXAI</span>
          </span>
          <span className="dashboard-text-gradient mt-2 block pl-[24px] sm:text-[24px] lg:text-[32px] leading-none">
            {formatCurrencyWithDecimals.format(xaiBalance)} XAI
          </span>
          <span className="mt-2 block pl-[24px] xl:mt-8">Sentry keys</span>
          <span className="dashboard-text-gradient block pl-[24px] sm:text-[24px] lg:text-[32px]">
            {unstakedKeyCount} keys
          </span>
          <Image
            className="absolute right-[-80px] top-0 z-0"
            width="628"
            src={cardBackground}
            alt="cardBackground"
            priority={true}
          />
        </section>
      ) : (
        <section
          className="relative flex w-full max-w-[928px] flex-col items-center justify-center overflow-hidden rounded-2xl border-1 border-silverMist text-center shadow-md sm:min-h-[262px] sm:px-[32px] md:px-0 lg:h-[353px]">
          <span className="mb-1 text-lg font-bold">Wallet not connected</span>
          <span className="text-base sm:mb-4 lg:mb-7">
            Connect your wallet to get access to XAI staking and redemptions
          </span>
          <ConnectButton onOpen={open} address={address} />
          <Image
            className="absolute right-[-80px] top-[40px] z-[-1]"
            width="628"
            src={cardBackground}
            alt="cardBackground"
            priority={true}
          />
        </section>
      )}
    </>
  );
};

export default DashboardCard;
