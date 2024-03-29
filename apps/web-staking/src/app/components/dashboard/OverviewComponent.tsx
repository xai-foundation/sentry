import {
  useGetBalanceHooks,
  useGetRedemptionsHooks,
  useGetTotalStakedHooks,
} from "@/app/hooks/hooks";

import { BoardComponent } from "./BoardComponent";
import ButtonView from "./ButtonView";
import { CardComponent } from "./CardComponent";
import PoolOverviewComponent from "./PoolOverviewComponent";
import { default as StakeComponent } from "../staking/TotalStakedComponent";
import MainTitle from "../titles/MainTitle";
import AgreeModalComponent from "../modal/AgreeModalComponents";

interface OverviewProps {
  onOpen: () => void;
  address: string | undefined;
}

export const OverviewComponent = ({
  onOpen,
  address,
}: OverviewProps) => {
  const { xaiBalance, esXaiBalance } = useGetBalanceHooks();
  const { redemptions } = useGetRedemptionsHooks();
  const { totalStaked } = useGetTotalStakedHooks();

  return (
    <div className="min-w-full sm:grid sm:flex-col sm:items-center sm:p-4 lg:flex lg:items-start">
      <AgreeModalComponent address={address} />
      <MainTitle title={"Overview"} classNames="lg:pl-5" />
      <div className="flex w-full justify-between sm:flex-col lg:flex-row">
        <div className="flex sm:mb-4 sm:flex-col sm:items-start lg:mb-8 lg:pl-5">
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
      <PoolOverviewComponent />
    </div>
  );
};
