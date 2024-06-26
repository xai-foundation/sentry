import { formatWeiToEther } from "@sentry/core";
import { useWebBuyKeysContext } from '../contexts/useWebBuyKeysContext';

/**
 * PricePerKeyRow Component
 * 
 * This component renders pricing information for Xai Sentry Node Keys.
 * It displays the quantity, total price, and price per key for each pricing tier.
 * It uses the WebBuyKeysContext to access shared state and functions.
 * 
 * @returns {JSX.Element | null} The rendered PricePerKeyRow component or null if no data
 */
export function PricePerKeyRow(): JSX.Element | null {
    const {
        nodesAtEachPrice,
        currency,
        decimalPlaces,
        calculateTotalPrice,
        formatItemPricePer
    } = useWebBuyKeysContext();

    // Return null if there's no pricing data
    if (!nodesAtEachPrice || nodesAtEachPrice.length === 0) {
        return null;
    }

    return (
        <div>
            {nodesAtEachPrice
                .filter(item => Number(item.quantity) !== 0)
                .map((item, i) => (
                    <div key={`get-keys-${i}`}>
                        <div className="flex sm:flex-col lg:flex-row items-center justify-between text-xl">
                            {/* Quantity display */}
                            <div className="flex flex-row items-center gap-2 text-elementalGrey font-semibold">
                                <span className="">{item.quantity.toString()} x Xai Sentry Node Key</span>
                            </div>
                            {/* Price per key (mobile view) */}
                            <p className="text-base text-elementalGrey mb-4 sm:block lg:hidden">
                                {formatItemPricePer(item)} {currency} per key
                            </p>
                            {/* Total price display */}
                            <div className="flex flex-row items-center gap-1">
                                <span className="font-bold text-white text-2xl">
                                    {formatWeiToEther(calculateTotalPrice(), decimalPlaces)} {currency}
                                </span>
                            </div>
                        </div>
                        {/* Price per key (desktop view) */}
                        <p className="text-base text-elementalGrey sm:hidden lg:block">
                            {formatItemPricePer(item)} {currency} per key
                        </p>
                    </div>
                ))}
        </div>
    );
}