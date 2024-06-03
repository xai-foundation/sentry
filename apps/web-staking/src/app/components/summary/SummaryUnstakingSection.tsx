import React from "react";

import SummaryUnstakingItem, {
  REQUEST_TYPES,
} from "@/app/components/summary/SummaryUnstakingItem";
import {
  OrderedUnstakeRequests,
  UnstakeRequest,
} from "@/services/web3.service";
import { useAccount } from "wagmi";

interface SummaryUnstakingSection {
  unstakeRequests: OrderedUnstakeRequests;
  onClaimRequest: (unstakeRequest: UnstakeRequest) => object;
}

const SummaryUnstakingSection = ({
  unstakeRequests,
  onClaimRequest,
}: SummaryUnstakingSection) => {

  const { address } = useAccount();

  return (
    <>
      {(unstakeRequests.open.length > 0 || unstakeRequests.claimable.length > 0) && address && (
        <div className="bg-nulnOil/75 py-[27px] md:px-[24px] px-[18px] shadow-default relative">
          <div
            className="flex items-end after:content-[''] after:w-full after:h-[1px] after:bg-chromaphobicBlack after:absolute after:left-0 after:top-[85px]">
            <span className="block text-3xl font-bold text-white mr-3">Unstaking</span>

            {unstakeRequests.claimable.length > 0 && (
              <span className="block text-elementalGrey text-lg font-medium">
                  {unstakeRequests.claimable.length} complete
                </span>
            )}
            {unstakeRequests.open.length > 0 && (
              <>
                <span className="mx-1 block text-elementalGrey">&#183;</span>
                <span className="ml-2 block text-elementalGrey text-lg font-medium">
                {unstakeRequests.open.length} pending
              </span></>
            )}
          </div>
          <div className="mt-[50px] flex flex-col flex-wrap justify-between gap-y-[15px] lg:flex-row">
            {unstakeRequests.open.map((request: UnstakeRequest) => (
              <SummaryUnstakingItem
                key={request.index}
                onClaimRequest={onClaimRequest}
                requestType={REQUEST_TYPES.OPEN}
                request={request}
              />
            ))}
            {unstakeRequests.claimable.map((request: UnstakeRequest) => (
              <SummaryUnstakingItem
                key={request.index}
                onClaimRequest={onClaimRequest}
                requestType={REQUEST_TYPES.CLAIMABLE}
                request={request}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SummaryUnstakingSection;
