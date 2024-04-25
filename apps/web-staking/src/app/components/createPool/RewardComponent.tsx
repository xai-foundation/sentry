import MainTitle from "../titles/MainTitle";
import RemainingComponent from "./RemainingComponent";
import { PoolInput } from "../input/InputComponent";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ErrorCircle } from "../icons/IconsComponent";
import { useGetMaxBucketShares } from "@/app/hooks/hooks";

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
    <div className={`${hideTitle ? "" : "border-t-1"} w-full py-5 pb-[60px]`}>
      <MainTitle
        title="Reward breakdown"
        classNames={`text-xl font-bold !mb-8 ${hideTitle ? "hidden" : "block"}`}
      />
      <div className="grid lg:grid-rows-1 lg:grid-flow-col gap-10 mb-2.5">
        <PoolInput
          type="number"
          value={String(owner)}
          name="owner"
          label="Pool owner*"
          placeholder="0"
          isInvalid={
            showErrors && (Number(owner) > maxBucketSharest[0] || sum !== 100)
          }
          endContent={
            <div className="text-default-400 text-sm">
              % (Max {maxBucketSharest[0]}%)
            </div>
          }
          onChange={handleChange}
          hideErrorIcon
          classInput="max-w-[200px]"
          errorMessage={
            Number(owner) > maxBucketSharest[0]
              ? `Value can't be more than ${maxBucketSharest[0]}%`
              : ""
          }
        />
        <PoolInput
          type="number"
          value={String(keyholder)}
          name="keyholder"
          label="Keyholder*"
          placeholder="0"
          isInvalid={
            showErrors &&
            (Number(keyholder) > maxBucketSharest[1] || sum !== 100)
          }
          endContent={
            <div className="text-default-400 text-sm">
              % (Max {maxBucketSharest[1]}%)
            </div>
          }
          onChange={handleChange}
          hideErrorIcon
          classInput="max-w-[200px]"
          errorMessage={
            Number(keyholder) > maxBucketSharest[1]
              ? `Value can't be more than ${maxBucketSharest[1]}%`
              : ""
          }
        />
        <PoolInput
          type="number"
          value={String(staker)}
          name="staker"
          label="esXAI staker*"
          placeholder="0"
          isInvalid={
            showErrors && (Number(staker) > maxBucketSharest[2] || sum !== 100)
          }
          endContent={
            <div className="text-default-400 text-sm">
              % (Max {maxBucketSharest[2]}%)
            </div>
          }
          onChange={handleChange}
          hideErrorIcon
          classInput="max-w-[200px]"
          errorMessage={
            Number(staker) > maxBucketSharest[2]
              ? `Value can't be more than ${maxBucketSharest[2]}%`
              : ""
          }
        />
      </div>
      {showErrors && sum !== 100 && (
        <div className="flex items-center mb-2.5">
          <ErrorCircle width={16} height={16} />
          <span className="text-[#ED5F00] text-base font-normal ml-1">
            {sum < 100
              ? "The three percentages do not add up to 100%"
              : "The three percentages are above 100%"}
          </span>
        </div>
      )}

      <RemainingComponent sum={sum} />
    </div>
  );
};

export default RewardComponent;
