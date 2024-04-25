import moment from "moment/moment";
import { useState } from "react";
import { PrimaryButton } from "@/app/components/buttons/ButtonsComponent";
import { UnstakeRequest } from "@/services/web3.service";
import { formatCurrencyWithDecimals } from "@/app/utils/formatCurrency";

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

  const sendClaimRequest = () => {
    setTransactionPending(true);
    onClaimRequest(request);
  };

  return (
    <div className="flex w-full max-w-full items-center justify-between rounded-xl bg-crystalWhite px-[25px] py-[15px] lg:max-w-[49%]">
      <div>
        <span className="block text-xl font-medium text-lightBlackDarkWhite">
          {amount < 0.0001 ? "<0.0001" : formattedAmount} {isKeyRequest ? (amount > 1 ? "keys" : "key") : "esXAI"}
        </span>
        {/* <span className="block">Submitted {calculateLockTime(createdTime)}</span> */}
      </div>
      <div className="flex items-center ">
        <span className="mr-2 block">
          {(Date.now() - lockTime) <= 0
            ? `${moment.duration((lockTime - Date.now())).humanize()} left`
            : ""}
        </span>
        <PrimaryButton
          onClick={sendClaimRequest}
          btnText={"Claim"}
          isDisabled={requestType === REQUEST_TYPES.OPEN || transactionPending}
        />
      </div>
    </div>
  );
};

export default SummaryUnstakingItem;
