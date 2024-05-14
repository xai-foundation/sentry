import Image from "next/image";
import iconToken from "../icons/tokenicon.png";

interface CurrencyComponentProps {
  currency: string;
  keyBalance?: boolean;
  customClass?: string;
}

const CurrencyStakeComponent = ({
  currency,
  keyBalance,
  customClass,
}: CurrencyComponentProps) => {
  return (
    <div className="flex flex-col min-w-fit">
      <div className="flex items-center justify-end lg:pb-3 sm:pb-4">
        {!keyBalance && (
          <Image src={iconToken} width={32} height={32} alt="token icon" />
        )}
        <span
          className={`ml-2 flex flex-col items-end lg:text-4xl sm:text-2xl font-semibold ${customClass}`}
        >
          {currency}
        </span>
      </div>
    </div>
  );
};

export default CurrencyStakeComponent;
