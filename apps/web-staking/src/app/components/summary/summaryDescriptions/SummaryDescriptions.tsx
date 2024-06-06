import React, { useState } from "react";

import PoolSocials from "@/app/components/summary/summaryDescriptions/PoolSocials";
import { useGetPoolInfoHooks } from "@/app/hooks/hooks";
import { PoolInfo } from "@/types/Pool";

import { useRouter } from "next/navigation";
import SummaryAddress from "./SummaryAddress";
import ClaimableRewardsComponent from "@/app/components/staking/ClaimableRewardsComponent";
import PoolBreakdown from "@/app/components/summary/summaryDescriptions/PoolBreakdown";
import { TextButton } from "@/app/components/ui/buttons";

interface SummaryDescriptionsProps {
  poolInfo: PoolInfo;
  onClaim: () => void;
  transactionLoading: boolean;
  chainId?: number | undefined;
  address: string | undefined;
}

const SummaryDescriptions = ({
  poolInfo,
  onClaim,
  transactionLoading,
  chainId,
                               address
}: SummaryDescriptionsProps) => {
  const {
    rewardsValues: { owner, keyholder, staker },
    delegateAddress,
  } = useGetPoolInfoHooks();

  const router = useRouter();


  const [isTruncated, setIsTruncated] = useState(true);

  return (
    <>
      <div className="mt-[20px] flex w-full flex-col justify-between xl:flex-row">
        <div className="flex w-full flex-col items-center md:items-start">
          {address && <div className="mb-6 hidden w-full xl:flex relative shadow-light z-[10]">
            <ClaimableRewardsComponent
              totalClaimAmount={poolInfo.userClaimAmount || 0}
              onClaim={onClaim}
              disabled={transactionLoading || !poolInfo.userClaimAmount}
              wrapperClasses="absolute right-[25px] top-[-10px] z-10 lg:min-w-[456px]"
              rewardsText="Pool rewards"
            />
          </div>}
          <div
            className="flex w-full flex-col justify-between xl:flex-row items-start xl:items-center relative">
            <div className="flex items-center lg:px-0 px-[18px] h-[104px] md:h-auto">
              <img
                src={poolInfo?.meta?.logo}
                className="mr-5 min-h-[80px] w-[80px] md:size-[128px] rounded-full object-cover	border-2 "
                alt="avatar"
              />
              <div>
                <span className="mt-1 md:text-5xl text-[32px] font-bold leading-7 text-white">
                  {poolInfo?.meta?.name}
                </span>
                <PoolSocials poolInfo={poolInfo} />
              </div>
            </div>
            <div
              className="xl:static absolute md:top-[140px] top-[115px] mt-5 flex w-full max-w-full flex-col xl:flex-row items-center lg:items-start xl:mt-0 xl:max-w-[340px] xl:px-0 px-4">
              {address && <ClaimableRewardsComponent
                totalClaimAmount={poolInfo.userClaimAmount || 0}
                onClaim={onClaim}
                disabled={transactionLoading || !poolInfo.userClaimAmount}
                wrapperClasses="xl:hidden w-full xl:max-w-[456px] xl:mr-2 mr-0 z-10 text-nowrap gap-2 !pl-[15px] !pr-[25px] "
                claimAmountClasses="text-[30px] text-wrap"
                rewardsText="Pool rewards"
              />}
              <PoolBreakdown
                owner={Number(owner)}
                keyholder={Number(keyholder)}
                staker={Number(staker)}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className={`xl:mt-[40px] mt-[80px] w-full text-elementalGrey bg-nulnOil/75 py-[25px] md:px-[24px] px-[18px] min-h-[196px] shadow-default z-[5] ${address ? "pt-[180px] lg:pt-[220px]" : "pt-[80px] lg:pt-[110px]"} xl:pt-[25px]`}>
        <span
          className={`block w-full font-medium text-lg max-w-[751px] text-elementalGrey md:mb-3 mb-0 lg:overflow-visible lg:whitespace-normal ${isTruncated && poolInfo.meta.description.length > 98 ? "truncate" : ""}`}>{poolInfo?.meta?.description}</span>
        {poolInfo.meta.description.length > 98 && <TextButton
          onClick={() => setIsTruncated(prev => !prev)}
          buttonText={!isTruncated ? "Show less" : "Show more"}
          className="font-bold text-xl px-0 py-0 mb-3 lg:hidden block hover:text-hornetSting"
        />}
        {delegateAddress.length > 0 && (
          <SummaryAddress delegateAddress={delegateAddress} />
        )}
      </div>
    </>
  );
};

export default SummaryDescriptions;
