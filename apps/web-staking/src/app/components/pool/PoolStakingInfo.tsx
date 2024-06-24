import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import Link from "next/link";

import ProgressComponent, { Sizes } from "@/app/components/progress/Progress";
import { PrimaryButton } from "@/app/components/ui";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/app/components/ui/buttons";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { PoolInfo } from "@/types/Pool";

export enum PoolStakingButtonVariant {
  esXAI = "esXAI",
  keys = "keys",
}

interface PoolStakingInfoProps {
  progressValue: number;
  infoTitle: string;
  cardTitle: string;
  cardContent: string;
  variant: PoolStakingButtonVariant;
  children?: ReactNode;
  canStake: boolean;
  canUnstake: boolean;
  poolInfo: PoolInfo;
}

const PoolStakingInfo = ({
  progressValue,
  infoTitle,
  cardTitle,
  cardContent,
  children,
  variant,
  canStake,
                           canUnstake,
                           poolInfo
}: PoolStakingInfoProps) => {
  const router = useRouter();

  const { userStakedEsXaiAmount: stakedEsXAI, userStakedKeyIds: stakedKeys } = poolInfo;

  const { address } = useAccount();
  const { open } = useWeb3Modal();
  const formatPercentage = (value: number) => {
    if (value && String(value).includes(".")) {
      return String(value).slice(0, String(value).indexOf(".") + 2);
    }

    return value;
  };

  return (
    <div className="w-full bg-nulnOil/75 sm:box-shadow-default lg:shadow-default">
      <div
        className="flex md:px-[24px] px-[18px]  py-[10px] flex-col items-center md:flex-row after:content-[''] after:w-full after:h-[1px] after:bg-chromaphobicBlack after:absolute after:left-0 md:after:top-[75px] after:top-[120px]">
        <div className="flex w-full items-center md:gap-0 gap-3">
          <span
            className="xl:mr-6 md:mr-3 block xl:text-3xl text-2xl font-bold text-white text-nowrap">{infoTitle}</span>
          <div className="w-full max-w-[70px] md:max-w-[120px]">
            <ProgressComponent progressValue={progressValue} size={Sizes.SM} />
          </div>
          <span
            className="ml-3 block font-medium text-lg text-elementalGrey text-nowrap mr-2">{formatPercentage(progressValue)}% full</span>
        </div>
        {address ? <div className="mt-4 w-full flex items-center justify-end xl:gap-10 gap-5 md:mt-0 ">
            <Link
              href={`/staking/stake/${poolInfo.address}/${variant}?unstake=true`}
              className={`${canUnstake ? "text-hornetSting" : "text-darkRoom pointer-events-none"} text-lg font-bold md:text-end text-center text-nowrap w-full max-w-[35%] hover:text-white duration-200 ease-in`}
            >
              {`UNSTAKE ${variant === "keys" ? "KEYS" : "esXAI"}`}
            </Link>

          <PrimaryButton
            onClick={() => router.push(`/staking/stake/${poolInfo.address}/${variant}`)}
            btnText={`STAKE ${variant === "keys" ? "KEYS" : "esXAI"}`}
            size="md"
            className="w-full max-w-[190px] text-lg clip-path-8px"
            wrapperClassName="w-full max-w-[190px]"
            isDisabled={!canStake}
          />

        </div>
          :
          <div className="w-full max-w-[214px]">
            <ConnectButton address={address} onOpen={open} size={"md"} isFullWidth />
          </div>
        }
      </div>
      <div className="flex gap-14 text-white md:px-[24px] px-[18px]">{children}</div>
      {variant === PoolStakingButtonVariant.keys ? (stakedKeys.length > 0 && <div
            className="flex h-[95px] w-full flex-col justify-center gap-1 border-t-1 border-chromaphobicBlack bg-dynamicBlack md:px-[24px] px-[18px] text-white">
        <span className="block text-lg text-elementalGrey">{cardTitle}</span>
        <span className="block md:text-4xl text-2xl font-semibold">{cardContent}</span>
      </div>
        )
        : (stakedEsXAI && stakedEsXAI > 0 && <div
          className="flex h-[95px] w-full flex-col justify-center gap-1 border-t-1 border-chromaphobicBlack bg-dynamicBlack md:px-[24px] px-[18px] text-white">
          <span className="block text-lg text-elementalGrey">{cardTitle}</span>
          <span className="block md:text-4xl text-2xl font-semibold">{cardContent}</span>
        </div>)
      }
    </div>
  );
};

export default PoolStakingInfo;
