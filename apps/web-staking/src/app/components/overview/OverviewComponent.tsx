import { CardComponent } from "./CardComponent";
import { default as StakeComponent } from "../staking/TotalStakedComponent";
import MainTitle from "../titles/MainTitle";
import { BoardComponent } from "./BoardComponent";
import {
  useGetBalanceHooks,
  useGetRedemptionsHooks,
  useGetTotalStakedHooks,
} from "@/app/hooks/hooks";
import PoolComponent from "./PoolComponent";
import ButtonView from "./ButtonView";

interface OverviewProps {
  onOpen: () => void;
  address: string | undefined;
}

export const OverviewComponent = ({ onOpen, address }: OverviewProps) => {
  const { xaiBalance, esXaiBalance } = useGetBalanceHooks();
  const { redemptions } = useGetRedemptionsHooks();
  const { totalStaked } = useGetTotalStakedHooks();

  return (
    <div className="sm:p-4 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
      <MainTitle title={"Overview"} classNames="lg:pl-5" />
      <div className="flex lg:flex-row sm:flex-col w-full justify-between">
        <div className="flex sm:flex-col sm:items-start lg:pl-5 lg:mb-8 sm:mb-4">
          <BoardComponent
            address={address}
            xaiBalance={xaiBalance}
            esXaiBalance={esXaiBalance}
          />
        </div>
        <ButtonView onOpen={onOpen} address={address} />
      </div>
      {address && (
        <div className="w-full">
          <CardComponent
            title={"Claimable XAI redemptions"}
            redemptions={redemptions}
          />
        </div>
      )}
      <StakeComponent
        address={address}
        title={"Total staked esXAI"}
        onOpen={onOpen}
        btnText={"Stake"}
        subTitle={"Available for staking:"}
        totalStaked={totalStaked}
        showProgressBar
        showTier
        unstake
      />
      <PoolComponent />
    </div>
  );
};
