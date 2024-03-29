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
    <>
      <MainTitle
        title="Stake a key to finish creating your pool"
        classNames="text-xl font-bold !mb-3"
      />
      <span className="mb-10">
        Each pool requires at least one staked key from the pool creator
      </span>
      <div className="flex items-center mb-4">
        <span className="mr-2">Staking to:</span>
        <Avatar src={logoUrl} className="w-[32px] h-[32px] mr-2" />
        <span className="text-graphiteGray">{name}</span>
      </div>
    </>
  );
};

export default KeyInfoComponent;
