import moment from "moment/moment";
import { useState } from "react";
import { UnstakeRequest } from "@/services/web3.service";
import { formatCurrencyWithDecimals } from "@/app/utils/formatCurrency";
import { BaseCallout, PrimaryButton } from "@/app/components/ui";

export enum REQUEST_TYPES {
  CLAIMABLE = "claimable",
  OPEN = "open",
}

interface SummaryUnstakingItemProps {
  request: UnstakeRequest;
  requestType: REQUEST_TYPES;
  onClaimRequest: (unstakeRequest: UnstakeRequest) => object;
}

const SummaryUnstakingItem = ({
  onClaimRequest,
  request,
  requestType,
}: SummaryUnstakingItemProps) => {
  moment.relativeTimeThreshold('d', 61);
  const { amount, isKeyRequest, lockTime } = request;
  const [transactionPending, setTransactionPending] = useState(false);
  const formattedAmount = formatCurrencyWithDecimals.format(amount);

  // Note: button state remains disabled on a cancel transaction. There was discussion about
  // refactoring the transaction pending state to be handled by the parent component or handling
  // the tx initialization through this component. This would allow the button state to be re-enabled upon cancellation.
  // Noting here in case we decide to implement in the future.
  // https://github.com/xai-foundation/sentry/pull/425

  const sendClaimRequest = () => {
    setTransactionPending(true);
    onClaimRequest(request);
  };

  return (
    <BaseCallout
      withOutSpecificStyles
      extraClasses={{
        calloutWrapper: "w-full lg:max-w-[49.5%] max-w-full h-[88px]",
        calloutFront: "px-[18px] py-[10px] !bg-dynamicBlack !px-[24px]"
      }}>
      <div
        className="flex w-full justify-between items-center rounded-xlpx-[25px] text-white">
        <div>
        <span className="block text-xl font-semibold">
          {amount < 0.0001 ? "<0.0001" : formattedAmount} {isKeyRequest ? (amount > 1 ? "keys" : "key") : "esXAI"}
        </span>
          {/* <span className="block">Submitted {calculateLockTime(createdTime)}</span> */}
        </div>
        <div className="flex items-center ">
        <span className="mr-2 block text-elementalGrey">
          {(Date.now() - lockTime) <= 0
            ? `${moment.duration((lockTime - Date.now())).humanize()} left`
            : ""}
        </span>
          <PrimaryButton
            onClick={sendClaimRequest}
            btnText={"Claim"}
            isDisabled={requestType === REQUEST_TYPES.OPEN || transactionPending}
            className="clip-path-8px uppercase pt-[7px]"
            size="sm"
          />
        </div>
      </div>
    </BaseCallout>
  );
};

export default SummaryUnstakingItem;
