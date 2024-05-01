import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import Link from "next/link";

import { PrimaryButton } from "@/app/components/buttons/ButtonsComponent";
import ProgressComponent, { Sizes } from "@/app/components/progress/Progress";

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
  poolAddress: string;
  canStake: boolean;
  canUnstake: boolean;
}

const PoolStakingInfo = ({
  progressValue,
  infoTitle,
  cardTitle,
  cardContent,
  children,
  poolAddress,
  variant,
  canStake,
  canUnstake
}: PoolStakingInfoProps) => {
  const router = useRouter();
  const formatPercentage = (value: number) => {
    if (String(value).includes(".") && value < 100 && value > 10) {
      return String(value).slice(0, 4);
    }
    if (String(value).includes(".") && value < 10 && value) {
      return String(value).slice(0, 3);
    }
    return value;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center md:flex-row">
        <div className="flex w-full items-center">
          <span className="mr-6 block text-xl font-bold">{infoTitle}</span>
          <div className="w-full max-w-[70px] md:max-w-[120px]">
            <ProgressComponent progressValue={progressValue} size={Sizes.SM} />
          </div>
          <span className="ml-3 block">{formatPercentage(progressValue)}% full</span>
        </div>
        <div className="mt-4 flex w-full items-center justify-start gap-10 md:mt-0  md:justify-end">

          {canUnstake && <Link
            href={`/staking/stake/${poolAddress}/${variant}?unstake=true`}
            className="text-red text-base font-medium"
          >{`Unstake ${variant}`}

          </Link>}

          <PrimaryButton
            onClick={() => router.push(`/staking/stake/${poolAddress}/${variant}`)}
            btnText={`Stake ${variant}`}
            className="w-full max-w-[134px] text-base"
            isDisabled={!canStake}
          />

        </div>
      </div>
      <hr className="mb-4 mt-2" />
      <div className="flex gap-14">{children}</div>
      <div className="my-2 flex h-[95px] w-full flex-col justify-center gap-1 rounded-2xl bg-crystalWhite px-5 md:my-5">
        <span className="block">{cardTitle}</span>
        <span className="block text-2xl font-bold">{cardContent}</span>
      </div>
    </div>
  );
};

export default PoolStakingInfo;
