import { useState } from "react";
import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import { StakingInput } from "../input/InputComponent";
import { useGetMaxKeyPerPool, useGetUnstakedNodeLicenseCount } from "@/app/hooks/hooks";
import MainTitle from "../titles/MainTitle";
import moment from "moment";
import AvailableBalanceComponent from "../stake/AvailableBalanceComponent";
import { PoolInfo } from "@/types/Pool";
import { Avatar } from "@nextui-org/react";
import StakeKeysDetailReviewComponent from "./StakeKeysDetailReviewComponent";
import WarningComponent from "@/app/components/createPool/WarningComponent";
import CurrencyStakeComponent from "../stake/CurrencyStakeComponent";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";

interface StakePoolKeytProps {
  userPool: PoolInfo;
  address: string | undefined;
  onBack: () => void;
  unstakeKey: boolean;
  isBannedPool: boolean;
  unstakePeriods: {
    unstakeKeysDelayPeriod: string;
    unstakeGenesisKeyDelayPeriod: string;
    unstakeEsXaiDelayPeriod: string;
  }
}

export default function StakingKeysDetailComponent({
  userPool,
  address,
  onBack,
  unstakeKey,
  isBannedPool,
  unstakePeriods
}: StakePoolKeytProps) {
  const [inputValue, setInputValue] = useState("");
  const [reviewVisible, setReviewVisible] = useState(false);
  const [checkbox, setCheckbox] = useState(unstakeKey ? true : false); // only show and require checkbox when staking
  const { unstakedKeyCount } = useGetUnstakedNodeLicenseCount();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const roundNum = Math.round(Number(e.target.value));
    setInputValue(roundNum.toString());
  };

  const { maxKeyPerPool } = useGetMaxKeyPerPool();

  moment.relativeTimeThreshold("d", 1000);

  const getMaxKeysForUnstake = () => {

    let unstakeCount = userPool.userStakedKeyIds.length - (userPool.unstakeRequestkeyAmount || 0);
    if (unstakeCount == 0) {
      return 0;
    }
    if (address == userPool.owner) {
      if (unstakeCount != 1) {
        //Owner can only unstake up to 1 key and has to do a dedicated request for the last key
        unstakeCount -= 1;
      }
    }
    return Math.min(100, unstakeCount);
  }

  const getMaxKeysForStake = (): number => {
    return Math.min(100, unstakedKeyCount, maxKeyPerPool - userPool.keyCount)
  }

  const isInvalidInput = () => {
    if (unstakeKey) {
      return Number(inputValue) > getMaxKeysForUnstake();
    }
    return Number(inputValue) > getMaxKeysForStake();
  };

  const isLastKeyOfOwner = (): boolean => {
    if (unstakeKey && address == userPool.owner && userPool.userStakedKeyIds.length - (userPool.unstakeRequestkeyAmount || 0) == 1) return true;
    else return false;
  }

  const confirmButtonDisabled = () => {
    return !address || !inputValue || Number(inputValue) <= 0 || isInvalidInput() || !checkbox || (isBannedPool && !unstakeKey);
  }

  return (
    <>
      {reviewVisible ? (
        <StakeKeysDetailReviewComponent
          pool={userPool}
          onBack={() => setReviewVisible(false)}
          inputValue={inputValue}
          unstake={unstakeKey}
          lastKeyOfOwner={isLastKeyOfOwner()}
        />
      ) : (
        <div className="flex flex-col items-start">
          <ButtonBack onClick={onBack} btnText="Back" />
          <MainTitle title={unstakeKey ? "Unstake keys" : "Stake keys"} />

          <>
            {!unstakeKey && (
              <div className="max-w-xl w-full py-3">
                <WarningComponent
                  title="By staking keys with this pool, you will give the pool the ability to operate your keys and perform assertions and claims"
                  description="Your key’s rewards will be distributed to the staking pool, and the pools reward tiers will apply to your key"
                  checkboxText="I agree to allow the pool to operate my keys and perform assertions and claims with my keys"
                  onAcceptTerms={() => { }}
                  includeYouMustAgreeMessage={true}
                  checkbox={checkbox}
                  setCheckbox={setCheckbox}
                />
              </div>
            )}

            {isLastKeyOfOwner() && (
              <div className="max-w-xl w-full p-3">
                <WarningComponent
                  title="You are unstaking the genesis key from your pool"
                  description={`This will require a ${unstakePeriods.unstakeGenesisKeyDelayPeriod} unstaking period. Once unstaked, the genesis key will be locked for ${unstakePeriods.unstakeGenesisKeyDelayPeriod} until it is claimable.`}
                  onAcceptTerms={() => { }}
                  includeYouMustAgreeMessage={false}
                  includeCheckbox={false}
                  checkbox={checkbox}
                  setCheckbox={setCheckbox}
                />
              </div>
            )}

          </>
          <div className="w-full">
            <div className="flex items-start mb-4">
              <span className="mr-2">{unstakeKey ? 'Unstake from:' : 'Stake to:'}</span>
              <Avatar src={userPool.meta.logo} className="w-[32px] h-[32px] mr-2" />
              <span className="text-graphiteGray">{userPool.meta.name}</span>
            </div>
            <BorderWrapperComponent>
              <StakingInput
                value={inputValue}
                label={unstakeKey ? "You unstake" : "You stake"}
                placeholder="0"
                onChange={handleChange}
                isInvalid={isInvalidInput()}
                keys
                unstake={unstakeKey}
                endContent={
                  <CurrencyStakeComponent currency="Sentry Key" keyBalance />
                }
              />
              <AvailableBalanceComponent
                keyBalance={
                  unstakeKey ? getMaxKeysForUnstake() : getMaxKeysForStake()
                }
                onMaxBtnClick={() =>
                  setInputValue(
                    unstakeKey
                      ? String(getMaxKeysForUnstake())
                      : String(getMaxKeysForStake())
                  )
                }
              />
            </BorderWrapperComponent>
          </div>
          <PrimaryButton
            onClick={() => {
              setReviewVisible(true);
            }}
            btnText="Continue"
            className="w-full disabled:opacity-50"
            isDisabled={confirmButtonDisabled()}
          />
        </div>
      )}
    </>
  );
};
