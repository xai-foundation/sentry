import { useState } from "react";
import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import { StakingInput } from "../input/InputComponent";
import { useGetUnstakedNodeLicenseCount } from "@/app/hooks/hooks";
import MainTitle from "../titles/MainTitle";
import AvailableBalanceComponent from "../stake/AvailableBalanceComponent";
import KeyInfoComponent from "./KeyInfoComponent";
import KeyReviewComponent from "./KeyReviewComponent";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import CurrencyStakeComponent from "../stake/CurrencyStakeComponent";

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
  stakeKey
}: StakePoolKeyProps) => {
  const [inputValue, setInputValue] = useState("");
  const [reviewVisible, setReviewVisible] = useState(false);
  const [acceptedTerms, setAcceptTerms] = useState(false);
  const { unstakedKeyCount } = useGetUnstakedNodeLicenseCount();

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
        <div className="flex flex-col items-start">
          <ButtonBack onClick={onBack} btnText="Back" />
          <MainTitle title="Create new pool" />
          <KeyInfoComponent name={poolName} logoUrl={poolLogoUrl} />
          <BorderWrapperComponent>
            <StakingInput
              unstake={stakeKey}
              value={inputValue}
              label="You stake"
              placeholder="0"
              onChange={handleChange}
              isInvalid={validationInput()}
              keys
              endContent={<CurrencyStakeComponent currency="Sentry Key" keyBalance />} />
            <AvailableBalanceComponent
              keyBalance={Math.min(100, unstakedKeyCount)}
              onMaxBtnClick={() => setInputValue(String(Math.min(100, unstakedKeyCount)))}
            />
          </BorderWrapperComponent>
          <PrimaryButton
            onClick={() => {
              setReviewVisible(true);
            }}
            btnText="Continue"
            className="w-full disabled:opacity-50"
            isDisabled={checkDisabledButton}
          />
        </div>
      )}
    </>
  );
};

export default StakePoolKeyComponent;
