import moment from "moment/moment";
import { useState } from "react";
import { PrimaryButton } from "@/app/components/buttons/ButtonsComponent";
import { UnstakeRequest } from "@/services/web3.service";

export enum REQUEST_TYPES {
  CLAIMABLE = "claimable",
  OPEN = "open",
}

interface SummaryUnstakingItemProps {
  request: UnstakeRequest;
  requestType: REQUEST_TYPES;
  onClaimRequest: (unstakeRequest: UnstakeRequest) => object;
}

const calculateCompleteTime = (time: number) => {
  const UNIT = "milliseconds";
  const duration = moment.duration(time - Date.now(), UNIT);
  const days = Math.floor(duration.asDays());
  const hours = Math.floor(duration.asHours());
  const minutes = Math.floor(duration.asMinutes());
  const seconds = Math.floor(duration.asSeconds());

  if (days >= 1) {
    return `${days}d`;
  } else if (hours >= 1) {
    return `${hours}h`;
  } else if (minutes >= 1) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
};

function formatTimeDifference(timeDifferenceInSeconds: number) {
  if (timeDifferenceInSeconds <= 0) {
    return "just now";
  } else if (timeDifferenceInSeconds < 60) {
    return `${timeDifferenceInSeconds}s ago`;
  } else if (timeDifferenceInSeconds < 3600) {
    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    return `${minutes}m ago`;
  } else if (timeDifferenceInSeconds < 86400) {
    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(timeDifferenceInSeconds / 86400);
    return `${days}d ago`;
  }
}

const calculateLockTime = (lockTime: number) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const differenceInSeconds = currentTime - Math.floor(lockTime / 1000);
  return formatTimeDifference(differenceInSeconds);
};

const SummaryUnstakingItem = ({
  onClaimRequest,
  request,
  requestType,
}: SummaryUnstakingItemProps) => {
  const { amount, isKeyRequest, createdTime, completeTime, lockTime } = request;
  const [transactionPending, setTransactionPending] = useState(false);

  const sendClaimRequest = () => {
    setTransactionPending(true);
    onClaimRequest(request);
  };

  return (
    <div className="flex w-full max-w-full items-center justify-between rounded-xl bg-crystalWhite px-[25px] py-[15px] lg:max-w-[49%]">
      <div>
        <span className="block text-xl font-medium text-lightBlackDarkWhite">
          {amount} {isKeyRequest ? (amount > 1 ? "keys" : "key") : "esXAI"}
        </span>
        {/* <span className="block">Submitted {calculateLockTime(createdTime)}</span> */}
      </div>
      <div className="flex items-center ">
        <span className="mr-2 block">
          {(Date.now() - lockTime) <= 0
            ? `${calculateCompleteTime(lockTime)} left`
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
