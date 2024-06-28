import { useCallback } from 'react';
import { useWebBuyKeysContext } from '../contexts/useWebBuyKeysContext';
import { CURRENCIES, Currency } from '@/features/hooks';

/**
 * ChooseCurrencyRow Component
 * 
 * This component renders a dropdown menu for selecting the payment currency.
 * It uses the WebBuyKeysContext to access and update the currency state.
 * 
 * @returns {JSX.Element} The rendered ChooseCurrencyRow component
 */
export function ChooseCurrencyRow(): JSX.Element {
    // Destructure setCurrency and currency from the context
    const { setCurrency, currency } = useWebBuyKeysContext();

    /**
     * Handles the change event of the currency select dropdown
     * 
     * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
     */
    const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrency(e.target.value as Currency);
    }, [setCurrency]);

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="mt-4">
                <hr className="my-2 border-[#525252]" />
                <div className="flex sm:flex-col lg:flex-row items-center justify-between py-2">
                    <div className="flex flex-row items-center gap-2 sm:text-xl lg:text-2xl">
                        <span className="text-[18px] text-elementalGrey font-medium">Choose payment currency</span>
                    </div>
                    <div className="flex flex-row items-center gap-1 bg-black">
                        <span className="text-white font-bold text-3xl bg-black">
                            {/* Form to prevent default submit behavior */}
                            <form onSubmit={(e) => e.preventDefault()}>
                                <select
                                    id="currency"
                                    name="currency"
                                    onChange={handleCurrencyChange}
                                    value={currency}
                                >
                                    {/* Render options for each currency */}
                                    {Object.entries(CURRENCIES).map(([key, value]) => (
                                        <option key={key} value={value}>{value}</option>
                                    ))}
                                </select>
                            </form>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}