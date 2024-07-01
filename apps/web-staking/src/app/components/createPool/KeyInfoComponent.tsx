import { Avatar } from "@nextui-org/react";
import MainTitle from "../titles/MainTitle";

const KeyInfoComponent = ({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string;
}) => {
  return (
    <div className="bg-nulnOil pt-5 w-full">
      <MainTitle
        title="Stake a key to finish creating your pool"
        classNames="text-lg font-bold !mb-[10px] normal-case sm:px-4 lg:px-6 !text-americanSilver"
      />
      <div className="text-americanSilver text-lg pb-5 sm:px-4 lg:px-6 max-w-[400px]">
        Each pool requires at least one staked key from the pool creator
      </div>
      <div className="flex items-center py-5 sm:px-4 lg:px-6 text-lg border-t border-chromaphobicBlack">
        <span className="mr-4 text-americanSilver">Staking to:</span>
        <Avatar src={logoUrl} className="w-[32px] h-[32px] mr-2" />
        <span className="text-white font-bold">{name}</span>
      </div>
    </div>
  );
};

export default KeyInfoComponent;
