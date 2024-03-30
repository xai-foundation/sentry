import React from "react";

import SummaryUnstakingItem, {
  REQUEST_TYPES,
} from "@/app/components/summary/SummaryUnstakingItem";
import {
  OrderedUnstakeRequests,
  UnstakeRequest,
} from "@/services/web3.service";

interface SummaryUnstakingSection {
  unstakeRequests: OrderedUnstakeRequests;
  onClaimRequest: (unstakeRequest: UnstakeRequest) => object;
}

const SummaryUnstakingSection = ({
  unstakeRequests,
  onClaimRequest,
}: SummaryUnstakingSection) => {

  return (
    <>
      {(unstakeRequests.open.length > 0 || unstakeRequests.claimable.length > 0) && (
        <div>
          <div className="flex items-center">
            <span className="block text-xl font-bold">Unstaking</span>
            {unstakeRequests.open.length > 0 && (
              <span className="ml-2 block">
                {unstakeRequests.open.length} pending
              </span>
            )}
            {unstakeRequests.claimable.length > 0 && (
              <>
                <span className="mx-1 block">&#183;</span>
                <span className="block">
                  {unstakeRequests.claimable.length} ready
                </span>
              </>
            )}
          </div>
          <div className="mt-5 flex flex-col flex-wrap justify-between gap-y-4 lg:flex-row">
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
