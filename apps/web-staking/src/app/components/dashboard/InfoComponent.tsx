import { OrderedRedemptions } from "@/services/web3.service";

interface InfoComponentProps {
  title: string;
  redemptions?: OrderedRedemptions;
}

const InfoComponent = ({ title, redemptions }: InfoComponentProps) => {
  return (
    <div className="flex flex-col lg:p-7 sm:py-4 sm:px-3">
      <span className="text-graphiteGray lg:text-lg sm:text-sm mb-1">
        {title}
      </span>
      <span className="text-lightBlackDarkWhite text-2xl mb-2 font-medium">
        {redemptions?.claimable.length
          ? `${redemptions?.claimable.reduce(
              (acc, request) => acc + request.receiveAmount,
              0
            )}`
          : "0.00"}
      </span>
    </div>
  );
};

export default InfoComponent;
