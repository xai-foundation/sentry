import moment from "moment";
import MainTitle from "../titles/MainTitle";
import WarningComponent from "./WarningComponent";
import { Avatar } from "@nextui-org/react";
import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import { useState } from "react";
import { useGetUnstakePeriods } from "@/app/hooks/hooks";

interface KeyReviewProps {
  name: string;
  logoUrl: string;
  inputValue: string;
  onBack: () => void;
  onConfirm: () => void;
  onAcceptTerms: () => void;
  transactionLoading: boolean;
}

const KeyReviewComponent = ({
  name,
  logoUrl,
  inputValue,
  onBack,
  onConfirm,
  onAcceptTerms,
  transactionLoading,
}: KeyReviewProps) => {
  const [checkbox, setChecbox] = useState(false);
  const unstakePeriods = useGetUnstakePeriods();
  moment.relativeTimeThreshold("d", 1000);

  return (
    <main className="flex w-full flex-col items-center">
      <div className="group flex flex-col items-start max-w-xl w-full p-3">
        <ButtonBack onClick={onBack} btnText="Back" />
        <MainTitle title={`Review stake`} />
        <WarningComponent
          title={`The final key you unstake from this pool will take ${unstakePeriods.unstakeGenesisKeyDelayPeriod} to unstake.`}
          description={`All other keys you unstake will take ${unstakePeriods.unstakeKeysDelayPeriod} to unstake.`}
          checkboxText="I understand the unstake periods for my keys."
          onAcceptTerms={onAcceptTerms}
          checkbox={checkbox}
          setCheckbox={setChecbox}
        />
        <div className="flex items-center mb-4">
          <span className="mr-2">Staking to:</span>
          <Avatar src={logoUrl} className="w-[32px] h-[32px] mr-2" />
          <span className="text-graphiteGray">{name}</span>
        </div>
        <HeroStat label={"You stake"} value={`${inputValue} Sentry Key`} />
        <HeroStat
          label={"Pool staking balance after this stake"}
          value={`${inputValue} Sentry Key`} // TODO needs to be calculated with web3 function
        />
        <PrimaryButton
          onClick={onConfirm}
          btnText={`${transactionLoading ? "Waiting for confirmation..." : "Confirm"
            }`}
          className={`w-full mt-6 font-bold ${transactionLoading && "bg-[#B1B1B1] disabled"
            } disabled:opacity-50`}
          isDisabled={!checkbox}
        />
      </div>
    </main>
  );
};

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col mb-4 bg-crystalWhite w-full p-3 rounded-xl">
      <label className="text-[#4A4A4A] text-sm mb-1">{label}</label>
      <span className="text-lightBlackDarkWhite font-medium text-2xl mb-1">
        {value}
      </span>
    </div>
  );
}

export default KeyReviewComponent;
