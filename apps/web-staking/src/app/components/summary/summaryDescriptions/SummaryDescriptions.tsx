import { Avatar } from "@nextui-org/react";
import React from "react";

import PoolSocials from "@/app/components/summary/summaryDescriptions/PoolSocials";
import { useGetPoolInfoHooks } from "@/app/hooks/hooks";
import { PoolInfo } from "@/types/Pool";

import { ButtonBack } from "../../buttons/ButtonsComponent";
import { useRouter } from "next/navigation";
import SummaryAddress from "./SummaryAddress";
import ClaimableRewardsComponent from "@/app/components/staking/ClaimableRewardsComponent";

interface SummaryDescriptionsProps {
  poolInfo: PoolInfo;
  onClaim: () => void;
  transactionLoading: boolean;
  chainId?: number | undefined;
}

const SummaryDescriptions = ({
  poolInfo,
  onClaim,
  transactionLoading,
  chainId,
}: SummaryDescriptionsProps) => {
  const {
    rewardsValues: { owner, keyholder, staker },
    delegateAddress,
  } = useGetPoolInfoHooks();

  const router = useRouter();

  return (
    <>
      <div className="mt-[20px] flex w-full flex-col justify-between xl:flex-row">
        <div className=" flex w-full flex-col items-center md:items-start ">
          <div className="mb-6 hidden w-full xl:flex">
            <div className="mt-2 flex w-full justify-start">
              <ButtonBack
                btnText={"Back"}
                onClick={window && window.history.length > 2 ? () => router.back() : () => router.push(`/staking?chainId=${chainId}`)}
                extraClasses="h-[35px]"
              />
            </div>
            <ClaimableRewardsComponent
              totalClaimAmount={poolInfo.userClaimAmount || 0}
              onClaim={onClaim}
              disabled={transactionLoading || !poolInfo.userClaimAmount}
              rewardsText="Pool rewards"
            />
          </div>
          <div className="flex w-full flex-col justify-between xl:flex-row items-start xl:items-center">
            <div className="flex items-center">
              <Avatar
                src={poolInfo?.meta?.logo}
                className="mr-5 min-h-[80px] min-w-[80px] md:size-[128px]"
              />
              <div>
                <span className="mt-1 text-[32px] font-bold leading-7 text-lightBlackDarkWhite">
                  {poolInfo?.meta?.name}
                </span>
                <PoolSocials poolInfo={poolInfo} />
              </div>
            </div>
            <div className="mt-5 flex w-full max-w-full flex-col md:flex-row xl:mt-0 xl:max-w-[340px] ">
              <ClaimableRewardsComponent
                totalClaimAmount={poolInfo.userClaimAmount || 0}
                onClaim={onClaim}
                disabled={transactionLoading || !poolInfo.userClaimAmount}
                wrapperClasses="xl:hidden md:max-w-[50%] mr-2"
                rewardsText="Pool rewards"
              />
              <div
                className="mb-6 mr-2 flex h-[80px] w-full max-w-full items-center justify-between rounded-2xl border-1 border-silverMist px-5 py-3 xl:mb-0 xl:max-w-[340px] ">
                <div>
                  <span className="block text-xl font-medium">{owner}%</span>
                  <span className="block">Owner split</span>
                </div>
                <div>
                  <span className="block text-xl font-medium">
                    {keyholder}%
                  </span>
                  <span className="block">Key split</span>
                </div>
                <div>
                  <span className="block text-xl font-medium">{staker}%</span>
                  <span className="block">esXAI split</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 w-full text-graphiteGray">
        {poolInfo?.meta?.description}
      </div>
      {(delegateAddress.length > 0) && <SummaryAddress delegateAddress={delegateAddress} />}
    </>
  );
};

export default SummaryDescriptions;
