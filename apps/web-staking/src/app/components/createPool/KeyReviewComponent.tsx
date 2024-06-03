import { useState } from "react";
import { useGetUnstakePeriods } from "@/app/hooks/hooks";
import moment from "moment";
import MainTitle from "../titles/MainTitle";
import { Avatar } from "@nextui-org/react";
import { ButtonBack } from "../buttons/ButtonsComponent";
import { PrimaryButton } from "../ui";
import WarningComponent from "./WarningComponent";

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
    <main className="flex w-full flex-col items-center sm:pb-8 lg:pb-0">
      <div className="flex flex-col items-start max-w-[500px] w-full p-0">
        <ButtonBack
          onClick={onBack}
          btnText="Back to previous step"
          extraClasses="text-white text-lg font-bold uppercase mb-4 sm:px-4 lg:px-0"
        />
        <MainTitle title={`CREATE NEW POOL`} classNames="sm:px-4 lg:px-0" />

        <div className="bg-nulnOilBackground w-full shadow-default">
          <div className="p-5 border-b border-chromaphobicBlack">
            <WarningComponent
              title={`The final key you unstake from this pool will take ${unstakePeriods.unstakeGenesisKeyDelayPeriod} to unstake.`}
              description={`All other keys you unstake will take ${unstakePeriods.unstakeKeysDelayPeriod} to unstake.`}
              checkboxText="I understand the unstake periods for my keys."
              onAcceptTerms={onAcceptTerms}
              checkbox={checkbox}
              setCheckbox={setChecbox}
            />
          </div>
          <div className="flex items-center text-lg border-b border-chromaphobicBlack sm:px-4 lg:px-6 py-7">
            <span className="mr-4 text-americanSilver">Staking to:</span>
            <Avatar src={logoUrl} className="w-[32px] h-[32px] mr-2" />
            <span className="text-white font-bold">{name}</span>
          </div>
          <HeroStat label={"You stake"} value={`${inputValue} ${inputValue == "1" ? "Sentry Key" : "Sentry Keys" }`} />
        </div>

        <div className="w-full">
          <PrimaryButton
            onClick={onConfirm}
            btnText={`${
              transactionLoading ? "Waiting for confirmation..." : "Confirm"
            }`}
            className={`w-full font-bold uppercase`}
            isDisabled={transactionLoading || !checkbox}
          />
        </div>
      </div>
    </main>
  );
};

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col mb-4 bg-nu w-full sm:px-4 lg:px-6 py-5 rounded-xl">
      <label className="text-americanSilver text-lg mb-1">{label}</label>
      <span className="text-white font-bold text-4xl mb-1">{value}</span>
    </div>
  );
}

export default KeyReviewComponent;
