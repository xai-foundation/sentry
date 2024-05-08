import { formatCurrency } from "@/app/utils/formatCurrency";

interface EsXaiComponentsProps {
  address: string | undefined;
  esXaiBalance: number;
  totalStaked?: number;
}

const EsXaiComponents = ({
  address,
  esXaiBalance,
}: // totalStaked,
EsXaiComponentsProps) => {

  return (
    <div
      className={
        "flex flex-col sm:mr-0 sm:mb-1 sm:min-w-[270px] lg:min-w-[0px] lg:mb-0 py-1"
      }
    >
      <span className="text-graphiteGray text-lg mb-1">Wallet balance</span>
      <span className="text-lightBlackDarkWhite text-4xl font-medium">
        {address ? `${formatCurrency.format(esXaiBalance)} esXAI` : "— esXAI"}
      </span>
    </div>
  );
};

export default EsXaiComponents;
