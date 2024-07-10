import { useCallback } from 'react';
import MainCheckbox from "@sentry/ui/src/rebrand/checkboxes/MainCheckbox";
import { KYCTooltip } from "./KYCTooltip";
import { useWebBuyKeysContext } from '../contexts/useWebBuyKeysContext';

/**
 * AgreementCheckboxes Component
 * 
 * This component renders a set of three checkboxes for user agreements
 * related to Sentry Node Keys. It uses the WebBuyKeysContext to manage
 * the state of the checkboxes.
 * 
 * @returns {JSX.Element} The rendered AgreementCheckboxes component
 */
export function AgreementCheckboxes(): JSX.Element {
    // Destructure the checkboxes state and setter from the context
    const { checkboxes, setCheckboxes } = useWebBuyKeysContext();

    /**
     * Handles the change of a checkbox state
     * 
     * @param {('one'|'two'|'three')} key - The key of the checkbox to update
     */
    const handleCheckboxChange = useCallback((key: 'one' | 'two' | 'three') => {
        setCheckboxes(prev => ({ ...prev, [key]: !prev[key] }));
    }, [setCheckboxes]);

    return (
        <div className="flex flex-col justify-center gap-8 mt-8">
            <div className="flex w-full flex-col justify-center gap-2">
                {/* Checkbox for Sentry Node Agreement */}
                <MainCheckbox
                    onChange={() => handleCheckboxChange('one')}
                    isChecked={checkboxes.one}
                    labelStyle="!items-start"
                >
                    <div className="sm:w-[200px] md:w-[300px] lg:w-auto">
                        <span className="sm:text-base text-elementalGrey sm:mr-2">I agree with the</span>
                        <a
                            className="cursor-pointer text-[#F30919] text-base"
                            onClick={() => window.open("https://xai.games/sentrynodeagreement/")}
                        >
                            Sentry Node Agreement
                        </a>
                    </div>
                </MainCheckbox>

                {/* Checkbox for non-transferable keys agreement */}
                <MainCheckbox
                    onChange={() => handleCheckboxChange('two')}
                    isChecked={checkboxes.two}
                    labelStyle="!items-start"
                >
                    <div className="sm:w-[300px] md:w-auto">
                        <span className="sm:text-base text-elementalGrey">
                            I understand Sentry Node Keys are not transferable
                        </span>
                    </div>
                </MainCheckbox>

                {/* Checkbox for KYC requirement agreement */}
                <MainCheckbox
                    onChange={() => handleCheckboxChange('three')}
                    isChecked={checkboxes.three}
                    labelStyle="!items-start"
                >
                    <div className="flex w-full sm:w-[300px] justify-between md:w-auto sm:flex-col lg:flex-row items-start">
                        <span className="sm:text-base text-elementalGrey lg:mr-2">
                            I understand that I cannot claim rewards until I pass KYC
                        </span>
                        {/* Tooltip for blocked countries information */}
                        <KYCTooltip width={850}>
                            <p className="text-[#F30919] text-base">(See blocked countries)</p>
                        </KYCTooltip>
                    </div>
                </MainCheckbox>
            </div>
        </div>
    )
}