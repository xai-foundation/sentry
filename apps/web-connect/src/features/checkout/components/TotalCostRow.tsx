import { formatWeiToEther } from "@sentry/core";

interface TotalCostRowProps {
    calculateTotalPrice: () => bigint;
    currency: string;
    balance: bigint;
    decimalPlaces: number;
}

export function TotalCostRow({
    calculateTotalPrice,
    balance,
    currency,
    decimalPlaces, 
}: TotalCostRowProps) {
    return (
            <div className="mt-1">
                <div className="flex sm:flex-col lg:flex-row items-center justify-between py-2">
                    <div className="flex flex-col items-left gap-2 sm:text-xl lg:text-2xl">
                    <span className="text-white font-bold text-2xl">You pay</span>
                    <span className="text-base text-elementalGrey">Available balance: {formatWeiToEther(balance, decimalPlaces)} {currency}</span>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                        <span className="text-white font-bold text-3xl">{formatWeiToEther(calculateTotalPrice(), decimalPlaces)}</span>
                        <span className="text-white font-bold text-3xl">{currency}</span>
                    </div>
                </div>
            </div>
    );
}
