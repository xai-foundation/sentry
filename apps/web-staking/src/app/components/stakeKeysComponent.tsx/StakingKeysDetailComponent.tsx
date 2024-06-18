import { useState } from "react";
import { useGetMaxKeyPerPool, useGetUnstakedNodeLicenseCount } from "@/app/hooks/hooks";
import MainTitle from "../titles/MainTitle";
import moment from "moment";
import { PoolInfo } from "@/types/Pool";
import { Avatar } from "@nextui-org/react";
import StakeKeysDetailReviewComponent from "./StakeKeysDetailReviewComponent";
import { ButtonBack, PrimaryButton } from "@/app/components/ui/buttons";
import { BaseCallout, Checkbox, StakingInput } from "@/app/components/ui";
import { WarningIcon } from "@/app/components/icons/IconsComponent";
import { StakingInputCurrency } from "@/app/components/ui/inputs/StakingInput";

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
    <div
      className={`flex w-full flex-col items-center lg:p-0 xl:ml-[-122px] lg:ml-[-61px] ${!unstakeKey && "md:mb-0 mb-[30px]"}`}>
      {reviewVisible ? (
        <StakeKeysDetailReviewComponent
          pool={userPool}
          onBack={() => setReviewVisible(false)}
          inputValue={inputValue}
          unstake={unstakeKey}
          lastKeyOfOwner={isLastKeyOfOwner()}
        />
      ) : (
        <div>
          <ButtonBack
            onClick={onBack}
            btnText={`Back to pool`}
            extraClasses="uppercase md:ml-0 ml-[15px]"
          />
          <MainTitle
            title={unstakeKey ? "Unstake keys" : "Stake keys"}
            classNames="md:ml-0 ml-[17px] mt-[18px] normal-case	!uppercase"
          />

          <div className="shadow-default">
            <div
              className="bg-nulnOil/75 w-full py-[25px] max-w-[506px]">
              <div className="flex flex-col  md:px-[25px] px-[17px]">
                {!unstakeKey && (
                  <>
                    <BaseCallout extraClasses={{
                      calloutWrapper: "w-full max-w-[456px] md:h-[182px] h-[233px]",
                      calloutFront: "!justify-start "
                    }}
                                 isWarning>
                      <div className="flex md:gap-[20px] gap-[10px]">
								      <span
                        className="block mt-2">{WarningIcon({})}
								      </span>
                        <div className="max-w-[358px]">
                          <span
                            className="block text-lg font-bold leading-[24px]">By staking keys with this pool, you will give the pool the ability to operate your keys and perform assertions and claims.
                          </span>
                          <span className="block leading-[24px] mt-2">
                            Your key’s rewards will be distributed to the staking pool, and the pools reward tiers will apply to your key.
                          </span>
                        </div>
                      </div>
                    </BaseCallout>
                    <div className="mt-5">
                    <span className="block text-americanSilver text-lg font-medium md:max-w-full max-w-[356px]">
                      You must agree to the following before continuing
                    </span>
                      <Checkbox
                        onChange={() => setCheckbox(prev => !prev)}
                        extraClasses={{ input: "min-w-[24px]", wrapper: "mt-3 !items-start" }}
                      >
                        <span className="text-americanSilver md:max-w-full max-w-[322px] text-lg">I agree to allow the pool to operate my keys and perform assertions and claims with my keys</span>
                      </Checkbox>
                    </div>
                  </>
                )}

                {isLastKeyOfOwner() && <div className="w-full">
                  <BaseCallout
                    extraClasses={{ calloutWrapper: "md:h-[160px] h-[190px] w-full" }}
                    isWarning
                  >
                    <div className="flex md:gap-[20px] gap-[10px]">
								      <span
                        className="block mt-2">{WarningIcon({})}
								      </span>
                      <div className="max-w-[358px]">
									      <span
                          className="block text-lg font-bold leading-[24px]"
                        >
                          You are unstaking the genesis key from your pool
									      </span>
                        <span className="block text-lg leading-[24px] mt-2">
                         This will require a {unstakePeriods.unstakeGenesisKeyDelayPeriod} waiting period.
                         Once the waiting period is complete, you will need to claim your key to complete the process.
                        </span>
                      </div>
                    </div>
                  </BaseCallout>
                </div>}

              </div>
              <div
                className={`w-full  ${!unstakeKey ? "border-t-1 border-chromaphobicBlack md:mt-[30px] mt-[15px] pt-[30px]" : "mt-[15px]"} ${unstakeKey && isLastKeyOfOwner() && "mt-[33px]"}`}>
                <div className={`flex items-start ${!unstakeKey ? "mb-4" : "mb-[25px]"} md:px-[25px] px-[17px]`}>
                <span
                  className="mr-5 text-americanSilver text-lg font-medium">{unstakeKey ? "Unstaking from:" : "Staking to:"}</span>
                  <Avatar src={userPool.meta.logo} className="w-[32px] h-[32px] mr-2" />
                  <span className="text-lg text-white font-bold">{userPool.meta.name}</span>
                </div>
                <div className="md:px-[25px] px-[17px]">
                  <StakingInput
                    value={inputValue}
                    label={unstakeKey ? "You unstake" : "You stake"}
                    currencyLabel={Number(inputValue) === 1 ? StakingInputCurrency.SENTRY_KEY : StakingInputCurrency.SENTRY_KEYS}
                    onChange={handleChange}
                    error={isInvalidInput() ? { message: Number(inputValue) > 100 ? "Invalid amount" : "Not enough keys" } : {}}
                    availableCurrency={(unstakeKey ? getMaxKeysForUnstake() : getMaxKeysForStake()) === 1 ? "key" : "keys"}
                    availableBalance={unstakeKey ? getMaxKeysForUnstake() : getMaxKeysForStake()}
                    handleMaxValue={() =>
                      setInputValue(
                        unstakeKey
                          ? String(getMaxKeysForUnstake())
                          : String(getMaxKeysForStake())
                      )}
                    extraClasses={{
                      calloutWrapper: "md:h-[140px] h-[165px]",
                      calloutFront: "!py-[3px]",
                      input: "placeholder:!text-foggyLondon"
                    }}
                  />
                </div>
              </div>
            </div>
            <PrimaryButton
              onClick={() => {
                setReviewVisible(true);
              }}
              btnText="Continue"
              wrapperClassName="w-full"
              className="w-full disabled:opacity-50 uppercase"
              isDisabled={confirmButtonDisabled()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
