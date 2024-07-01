import React from "react";

interface IAvailableBalanceRedeemComponentProps {
  balance: number | undefined,
  currency: string,
  onSelectMaxAmount: () => void
}

const AvailableBalanceRedeemComponent = ({
                                           balance,
                                           currency,
                                           onSelectMaxAmount
                                         }: IAvailableBalanceRedeemComponentProps) => {
  return (
    <div className="flex w-full flex-col px-5 pb-2 pt-0">
      <div className="flex items-center justify-end text-lightGrey sm:text-sm lg:text-base">
        {(balance || balance === 0) && (
          <span>Available: {balance} {currency}
            <span className="cursor-pointer text-red ml-1"
                  onClick={onSelectMaxAmount}> Max</span>
								</span>
        )}
      </div>
    </div>
  );
};

export default AvailableBalanceRedeemComponent;