import { CheckoutTierSummary, formatWeiToEther } from "@sentry/core";


interface PricePerKeyRowProps {
    getPriceData: { nodesAtEachPrice: Array<CheckoutTierSummary> } | undefined;
    currency: string;
    decimalPlaces: number;
    calculateTotalPrice: () => bigint;
    formatItemPricePer: (item: CheckoutTierSummary) => string;
}

export function PricePerKeyRow({
    getPriceData,
    currency,
    decimalPlaces,
    calculateTotalPrice,
    formatItemPricePer,
}: PricePerKeyRowProps) {
    if (!getPriceData || !getPriceData.nodesAtEachPrice) {
        return null;
    }
    return (
        <div>
            {getPriceData.nodesAtEachPrice
                .filter(item => Number(item.quantity) !== 0)
                .map((item, i) => (
                    <div key={`get-keys-${i}`}>
                        <div className="flex sm:flex-col lg:flex-row items-center justify-between text-xl">
                            <div className="flex flex-row items-center gap-2 text-elementalGrey font-semibold">
                                <span className="">{item.quantity.toString()} x Xai Sentry Node Key</span>
                            </div>
                            <p className="text-base text-elementalGrey mb-4 sm:block lg:hidden">
                                {formatWeiToEther(item.pricePer, decimalPlaces)} {currency} per key
                            </p>
                            <div className="flex flex-row items-center gap-1">
                                <span className="font-bold text-white text-2xl">
                                    {formatWeiToEther(calculateTotalPrice(), decimalPlaces)} {currency}
                                </span>
                            </div>
                        </div>
                        <p className="text-base text-elementalGrey sm:hidden lg:block">
                            {Number(formatItemPricePer(item)).toFixed(decimalPlaces)} {currency} per key
                        </p>
                    </div>
                ))}
        </div>
    );
}
