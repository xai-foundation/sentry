import EsXaiComponents from "./EsXaiComponents";
import XAIComponent from "./XAIComponent";

interface OverviewBoardProps {
  address: string | undefined;
  xaiBalance: number;
  esXaiBalance: number;
  totalStaked?: number;
}

export const BoardComponent = ({
  address,
  xaiBalance,
  esXaiBalance,
}: OverviewBoardProps) => {
  return (
    <>
      <EsXaiComponents address={address} esXaiBalance={esXaiBalance} />
      <XAIComponent address={address} xaiBalance={xaiBalance} />
    </>
  );
};
