import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import { PrimaryButton } from "../buttons/ButtonsComponent";

const ClaimableRewardsComponent = ({ totalClaimAmount, disabled, onClick }: { totalClaimAmount: number, disabled: boolean, onClick: () => void }) => {
  return (
    <BorderWrapperComponent customStyle="w-full sm:hidden lg:block !border-0 !mb-0 lg:w-1/4 py-1 px-4 bg-crystalWhite">
      <div className="flex flex-row items-center justify-between ">
        <span className="text-graphiteGray">Total claimable rewards</span>
        <PrimaryButton isDisabled={disabled} btnText="Claim" onClick={onClick} className="disabled:opacity-50" />
      </div>
      <div>
        <span className="text-lightBlackDarkWhite text-2xl font-medium">
          {totalClaimAmount} esXAI
        </span>
      </div>
    </BorderWrapperComponent>
  );
};

export default ClaimableRewardsComponent;
