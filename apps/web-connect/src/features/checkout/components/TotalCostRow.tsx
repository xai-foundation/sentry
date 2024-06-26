import { formatWeiToEther } from "@sentry/core";
import { useWebBuyKeysContext } from "../contexts/useWebBuyKeysContext";
import { CURRENCIES } from "@/features/hooks";


/**
 * TotalCostRow Component
 *
 * This component displays the total cost and available balance for purchasing Xai Sentry Node Keys.
 * It uses the WebBuyKeysContext to access shared state and functions.
 *
 * @returns {JSX.Element} The rendered TotalCostRow component
 */
export function TotalCostRow(): JSX.Element {
    // Destructure values and functions from the WebBuyKeysContext
    const {
        currency,
        tokenBalance,
        ethBalance,
        calculateTotalPrice,
        decimalPlaces,
    } = useWebBuyKeysContext();

    // Determine which balance to display based on whether the user has token balance
    const balance = currency === CURRENCIES.AETH ? ethBalance : tokenBalance;

    return (
        <div className="mt-1">
            <div className="flex sm:flex-col lg:flex-row items-center justify-between py-2">
                {/* Display the "You pay" text and the available balance */}
                <div className="flex flex-col items-left gap-2 sm:text-xl lg:text-2xl">
                    <span className="text-white font-bold text-2xl">You pay</span>
                    <span className="text-base text-elementalGrey">Available balance: {formatWeiToEther(balance, decimalPlaces)} {currency}</span>
                </div>
                {/* Display the total price */}
                <div className="flex flex-row items-center gap-1">
                    <span className="text-white font-bold text-3xl">{formatWeiToEther(calculateTotalPrice(), decimalPlaces)}</span>
                    <span className="text-white font-bold text-3xl">{currency}</span>
                </div>
            </div>
        </div>
    );
}
