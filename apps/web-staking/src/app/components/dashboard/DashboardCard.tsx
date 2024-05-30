import { useWeb3Modal } from "@web3modal/wagmi/react";
import Image from "next/image";
import React from "react";

import cardBackground from "@/assets/images/dashboard-card.png";
import { formatCurrencyWithDecimals } from "@/app/utils/formatCurrency";
import { ConnectButton } from "../ui/buttons";
import { ExternalLinkComponent } from "@/app/components/links/LinkComponent";

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

      <div
        className="flex w-full flex-col items-start md:flex-row md:justify-between py-[17px] md:px-[25px] px-[17px] bg-nulnOil/75 border-b-1 border-chromaphobicBlack shadow-default">
        <h3 className="md:text-3xl text-2xl text-white font-bold">Available balance</h3>
        {address && <div className="self-end md:self-center mb-[10px] md:mb-0 hidden lg:block">
          <ExternalLinkComponent
            link={"https://sentry.xai.games/"}
            content={"Buy keys"}
            customClass="mr-4 !text-lg !font-bold uppercase"
            externalTab
          />
          <ExternalLinkComponent
            link={
              "https://www.binance.com/en/trade/XAI_USDT?_from=markets&type=spot"
            }
            content={"Buy XAI"}
            customClass="mr-4 !text-lg !font-bold uppercase"
            externalTab
          />
          <ExternalLinkComponent
            link={"/redeem"}
            content={"Redeem"}
            customClass="!text-lg !font-bold uppercase"
          />
        </div>}
      </div>

      {address ? (
        <section
          className="relative w-full overflow-hidden py-[21px] lg:min-h-[348px] shadow-default  lg:bg-transparent bg-nulnOil/75">
          <div className="md:px-[25px] px-[17px]">
            <div
              className="bg-[#2E2729] relative z-[20] w-full xl:max-w-[556px] pt-[20px] global-cta-clip-path h-full max-h-[300px] flex flex-col justify-between">
              <div className="h-full lg:min-h-[179px] min-h-[140px]">
              <span
                className="block text-elementalGrey text-lg font-medium pl-[24px] ">esXAI balance</span>
                <span
                  className="block w-full text-[48px] lg:text-[64px] font-semibold text-white relative z-[20] pl-[24px] leading-none">
            {formatCurrencyWithDecimals.format(Number(esXaiBalance.toString().match(/^-?\d+(?:\.\d{0,4})?/)))}
                  <span className="ml-1">{" "} esXAI</span>
          </span>
              </div>
              <div
                className="flex gap-[50px] h-full lg:min-h-[104px] min-h-full border-t-1 border-darkRoom pl-[24px] py-[17px] bg-darkRoom/25">
                <div>
                <span className="text-elementalGrey block text-lg font-medium leading-none">
                XAI balance
              </span>
                  <span
                    className="text-white block text-[24px] lg:text-[32px] font-semibold ">
                {formatCurrencyWithDecimals.format(Number(xaiBalance.toString().match(/^-?\d+(?:\.\d{0,4})?/)))}
                    {" "} XAI
              </span>
                </div>
                <div>
                  <span className="text-elementalGrey text-lg font-medium block leading-none">Sentry keys</span>
                  <span className="text-white block text-[24px] lg:text-[32px] font-semibold">
                  {unstakedKeyCount} keys
                </span>
                </div>
              </div>

            </div>
          </div>
          <div className="mt-[17px] px-[25px] border-t-1 border-chromaphobicBlack block lg:hidden">
            <div className="flex md:justify-start gap-[0] md:gap-[20px] justify-between pt-[17px] lg:px-[25px]">
              <ExternalLinkComponent
                link={"https://sentry.xai.games/"}
                content={"Buy keys"}
                customClass="!text-lg !font-bold uppercase"
                externalTab
              />
              <ExternalLinkComponent
                link={
                  "https://www.binance.com/en/trade/XAI_USDT?_from=markets&type=spot"
                }
                content={"Buy XAI"}
                customClass="!text-lg !font-bold uppercase"
                externalTab
              />
              <ExternalLinkComponent
                link={"/redeem"}
                content={"Redeem"}
                customClass="!text-lg !font-bold uppercase"
              />
            </div>
          </div>
          <Image
            className="absolute left-0 xl:top-[-275px] lg:top-[-35px] z-[10] hidden lg:block"
            layout="fill"
            objectFit="cover"
            src={cardBackground}
            alt="cardBackground"
            priority={true}
          />
        </section>
      ) : (
        <section
          className="relative flex w-full flex-col md:items-start items-center justify-center overflow-hidden text-center sm:min-h-[262px] px-[17px] md:!pl-[70px] lg:h-[348px] bg-nulnOil/75 dashboard-card shadow-default">
          <span className="mb-1 md:text-3xl text-2xl text-white font-bold z-[20]">Wallet not connected</span>
          <span className="text-lg font-medium text-americanSilver mb-7 z-[20]">
            Connect your wallet to get access to XAI staking and redemptions
          </span>
          <ConnectButton onOpen={open} address={address} size="md" extraClasses="z-[20] global-cta-clip-path" />
          <Image
            className="absolute left-0 xl:top-[-275px] lg:top-[-35px] z-[10] hidden lg:block"
            layout="fill"
            objectFit="cover"
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
