import MainTitle from "../titles/MainTitle";
import RemainingComponent from "./RemainingComponent";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { WarningIcon } from "../icons/IconsComponent";
import { useGetMaxBucketShares } from "@/app/hooks/hooks";
import BaseInput, { InputSizes } from "../ui/inputs/BaseInput";
import { BaseCallout } from "../ui";

export type Rewards = {
  owner: number | "";
  keyholder: number | "";
  staker: number | "";
};

interface RewardProps {
  rewardsValues: Rewards;
  setRewardsValues: Dispatch<SetStateAction<Rewards>>;
  setError: Dispatch<SetStateAction<boolean>>;
  hideTitle?: boolean;
  showErrors?: boolean;
}

const RewardComponent = ({
  setError,
  rewardsValues,
  setRewardsValues,
  hideTitle,
  showErrors,
}: RewardProps) => {
  const [errorInput, setErrorInput] = useState(false);
  const { owner, keyholder, staker } = rewardsValues;
  const { maxBucketSharest } = useGetMaxBucketShares();

  let sum = Number((Number(owner) + Number(keyholder) + Number(staker)).toFixed(2));

  useEffect(() => {
    Number(owner) > maxBucketSharest[0] ||
    Number(keyholder) > maxBucketSharest[1] ||
    Number(staker) > maxBucketSharest[2]
      ? setErrorInput(true)
      : setErrorInput(false);
  }, [keyholder, maxBucketSharest, owner, setError, staker]);

  useEffect(() => {
    sum !== 100 || errorInput ? setError(true) : setError(false);
  }, [setError, sum, errorInput]);

  const addDecimals = (value: string) => {
    if (!value) {
      return "";
    }
    if (value.split(".")[1] && value.split(".")[1].split("").length > 2) {
      return Number(value).toFixed(2);
    }
    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRewardsValues({
      ...rewardsValues,
      [e.target.name]: addDecimals(e.target.value),
    });
  };

  return (
    <div className={`${hideTitle ? "pt-0" : ""} w-full mb-[30px] shadow-default`}>
      <div className={`w-full border-b border-chromaphobicBlack bg-nulnOilBackground py-5 px-6 shadow-default ${hideTitle ? "hidden" : "block"}`}>
        <MainTitle
          title="Reward breakdown"
          classNames={`text-[30px] font-bold !mb-0 normal-case`}
        />
      </div>
    
      <div className="grid lg:grid-rows-1 lg:grid-flow-col sm:gap-6 lg:gap-10 px-6 py-4 bg-nulnOilBackground shadow-default">
        
        <BaseInput
          type="number"
          value={String(owner)}
          name="owner"
          label="Pool owner*"
          placeholder="0"
          placeholderColor="placeholder-dugong text-lg"
          size={InputSizes.lg}
          isInvalid={showErrors && (Number(owner) > maxBucketSharest[0] || sum !== 100)}
          onChange={handleChange}
          inputMaxWidth=""
          endContent={
            <span className="text-dugong text-lg z-10 min-w-[100px]">
              % (Max {maxBucketSharest[0]}%)
            </span>
          }
        />

        <BaseInput
          type="number"
          value={String(keyholder)}
          name="keyholder"
          label="Keyholder*"
          placeholder="0"
          placeholderColor="placeholder-dugong text-lg"
          size={InputSizes.lg}
          isInvalid={showErrors && (Number(keyholder) > maxBucketSharest[1] || sum !== 100)}
          onChange={handleChange}
          inputMaxWidth=""
          endContent={
            <span className="text-dugong text-lg z-10 min-w-[100px]">
              % (Max {maxBucketSharest[1]}%)
            </span>
          }
        />

        <BaseInput
          type="number"
          value={String(staker)}
          name="staker"
          label="esXAI staker*"
          placeholder="0"
          placeholderColor="placeholder-dugong text-lg"
          size={InputSizes.lg}
          isInvalid={showErrors && (Number(staker) > maxBucketSharest[2] || sum !== 100)}
          onChange={handleChange}
          inputMaxWidth=""
          endContent={
            <span className="text-dugong text-lg z-10 min-w-[100px]">
              % (Max {maxBucketSharest[2]}%)
            </span>
          }
         />
      </div>

      {showErrors && sum !== 100 &&
        <div className="w-full bg-nulnOilBackground px-6 shadow-default">
        <BaseCallout isWarning extraClasses={{ calloutWrapper: "w-full sm:text-base lg:text-lg", calloutFront: "!justify-start" }}>
            <WarningIcon className="mr-2"/>
            {sum < 100
              ? "The three percentages do not add up to 100%"
              : "The three percentages are above 100%"}
        </BaseCallout>
        </div>}

      <RemainingComponent sum={sum} />
    </div>
  );
};

export default RewardComponent;
