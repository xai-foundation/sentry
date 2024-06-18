import React, { useState } from "react";
import { ButtonBack } from "../buttons/ButtonsComponent";
import { useGetMaxStakePerLicense, useGetUnstakedNodeLicenseCount } from "@/app/hooks/hooks";
import MainTitle from "../titles/MainTitle";
import KeyInfoComponent from "./KeyInfoComponent";
import KeyReviewComponent from "./KeyReviewComponent";
import { PrimaryButton, StakingInput, Tooltip } from "../ui";
import { StakingInputCurrency } from "../ui/inputs/StakingInput";
import { HelpIcon } from "@/app/components/icons/IconsComponent";
import TableTooltip from "@/app/components/ui/tooltips/TableTooltip";

interface StakePoolKeyProps {
  poolName: string;
  poolLogoUrl: string;
  address: string | undefined;
  onBack: () => void;
  onConfirm: (numKeys: number) => void;
  transactionLoading: boolean;
  stakeKey: boolean;
}

const StakePoolKeyComponent = ({
  poolName,
  poolLogoUrl,
  address,
  onBack,
  onConfirm,
  transactionLoading,
}: StakePoolKeyProps) => {
  const [inputValue, setInputValue] = useState("");
  const [reviewVisible, setReviewVisible] = useState(false);
  const [acceptedTerms, setAcceptTerms] = useState(false);
  const { unstakedKeyCount } = useGetUnstakedNodeLicenseCount();
  const { maxStakePerKey } = useGetMaxStakePerLicense();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const roundNum = Math.round(Number(e.target.value));
    setInputValue(roundNum.toString());
  };

  const validationInput = () => Number(inputValue) > Math.min(100, unstakedKeyCount);

  const checkDisabledButton =
    !address || !inputValue || Number(inputValue) <= 0 || validationInput();

  return (
    <>
      {reviewVisible ? (
        <KeyReviewComponent
          onConfirm={() => {
            if (!acceptedTerms) return;
            onConfirm(Number(inputValue))
          }}
          name={poolName}
          logoUrl={poolLogoUrl}
          onBack={() => setReviewVisible(false)}
          inputValue={inputValue}
          onAcceptTerms={() => setAcceptTerms(!acceptedTerms)}
          transactionLoading={transactionLoading}
        />
      ) : (
        <div className="flex flex-col items-start pb-5">
          <ButtonBack
            onClick={onBack}
            btnText="Back to previous step"
            extraClasses="text-white text-lg font-bold uppercase mb-4 sm:px-4 lg:px-0"
          />
          <MainTitle title="Create new pool" classNames="sm:px-4 lg:px-0" />
          <KeyInfoComponent name={poolName} logoUrl={poolLogoUrl} />
          <div className="bg-nulnOil pb-6 sm:px-4 lg:px-6 max-w-[500px]">
            <div className="relative">
              <StakingInput
                value={inputValue}
                label="You stake"
                onChange={handleChange}
                currencyLabel={Number(inputValue) === 1 ? StakingInputCurrency.SENTRY_KEY : StakingInputCurrency.SENTRY_KEYS}
                error={validationInput() ? { message: Number(inputValue) > 100 ? "Invalid amount" : "Not enough keys" } : {}}
                extraClasses={{
                  input: "sm:!max-w-[37%] !lg:max-w-[50%] placeholder:!text-foggyLondon",
                  calloutWrapper: "h-[160px]",
                  currency: "sm:text-3xl lg:text-4xl",
                  currencyWrapper: "justify-between"
                }}
                availableBalance={Math.min(100, unstakedKeyCount)}
                availableCurrency={Math.min(100, unstakedKeyCount) === 1 ? "key" : "keys"}
                withTooltip
                handleMaxValue={() =>
                  setInputValue(String(Math.min(100, unstakedKeyCount)))
                }
              />
              <span
                className="mt-1 absolute md:right-[58px] md:bottom-[27px] right-[62px] bottom-[35px]">
                <TableTooltip
                  extraClasses={{ tooltipContainer: "lg:left-auto lg:!right-[-38px] xl:left-[-38px] !left-auto !right-[-38px] md:max-w-[456px] max-w-[320px]" }}
                  content={"Your staking capacity is dependent on how many keys you own. Each key will increase your staking capacity by ##MAXSTAKE## esXAI".replace("##MAXSTAKE##", maxStakePerKey.toString())}>
                <HelpIcon
                  height={14}
                  width={14}
                />
              </TableTooltip>
              </span>
            </div>
          </div>
          <div className="w-full">
            <PrimaryButton
              onClick={() => {
                setReviewVisible(true);
              }}
              btnText="Continue"
              className="w-full uppercase"
              isDisabled={checkDisabledButton}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default StakePoolKeyComponent;
