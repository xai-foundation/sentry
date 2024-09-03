import { useState } from 'react';
import { useWebBuyKeysContext } from '../contexts/useWebBuyKeysContext';
import { CURRENCIES, Currency } from '@/features/hooks';
import { Dropdown, DropdownItem } from "@sentry/ui";

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
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Handles the change event of the currency dropdown
     * 
     * @param {Currency} value - The selected currency value
     */
    const handleChange = (value: Currency) => {
        setCurrency(value);
        setIsOpen(false);
    };

    /**
     * Generates dropdown items for the currency selection
     * 
     * @returns {JSX.Element[]} An array of DropdownItem elements
     */
    function getDropdownItems() {
        return Object.values(CURRENCIES).map((currency, i) => (
            <DropdownItem
                key={i.toString()}
                onClick={() => handleChange(currency)}
                dropdownOptionsCount={Object.values(CURRENCIES).length}
                extraClasses='bg-black text-white hover:bg-gray-700'
            >
                {currency}
            </DropdownItem>
        ));
    }

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
                                <Dropdown
                                    isOpen={isOpen}
                                    setIsOpen={setIsOpen}
                                    selectedValue={currency}
                                    selectedValueRender={
                                        <p>{currency}</p>
                                    }
                                    setSelectedValue={(e) => handleChange(e as Currency)}
                                    getDropdownItems={getDropdownItems}
                                    extraClasses={{ dropdown: "max-w-[170px] bg-black text-white", dropdownOptions: "w-[168px]" }}
                                    dropdownOptionsCount={Object.values(CURRENCIES).length}
                                />
                            </form>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
