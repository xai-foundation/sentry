import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { PropsWithChildren } from "react";

/**
 * Props for the KYCTooltip component
 * @interface TooltipProps
 * @extends {PropsWithChildren}
 */
interface TooltipProps extends PropsWithChildren {
    width?: number;
    position?: "start" | "center" | "end";
    side?: "top" | "right" | "bottom" | "left";
}

/**
 * List of countries with their translations that are not allowed to pass KYC
 */
const countryList: { country: string; translation: string }[] = [
	{country: "United States", translation: "United States"},
	{country: "Afghanistan", translation: "افغانستان‎"},
	{country: "Belarus", translation: "Беларусь"},
	{country: "Bosnia and Herzegovina", translation: "Босна и Херцеговина"},
	{country: "Burundi", translation: "Uburundi"},
	{country: "Central African Republic", translation: "République centrafricaine"},
	{country: "Congo (DRC)", translation: "Jamhuri ya Kidemokrasia ya Kongo"},
	{country: "Cuba", translation: "Cuba"},
	{country: "Ethiopia", translation: "Ethiopia"},
	{country: "Guinea", translation: "Guinée"},
	{country: "Guinea-Bissau", translation: "Guiné Bissau"},
	{country: "Haiti", translation: "Haiti"},
	{country: "Iran", translation: "ایران‎"},
	{country: "Iraq", translation: "العراق‎"},
	{country: "Kosovo", translation: "Kosovo"},
	{country: "Lebanon", translation: "لبنان‎"},
	{country: "Libya", translation: "ليبيا‎"},
	{country: "Mali", translation: "Mali"},
	{country: "Moldova", translation: "Republica Moldova"},
	{country: "Montenegro", translation: "Crna Gora"},
	{country: "Myanmar", translation: "Burma"},
	{country: "Nicaragua", translation: "Nicaragua"},
	{country: "North Korea", translation: "조선 민주주의 인민 공화국"},
	{country: "Russia", translation: "Россия"},
	{country: "Serbia", translation: "Србија"},
	{country: "Somalia", translation: "Soomaaliya"},
	{country: "South Sudan", translation: "جنوب السودان‎"},
	{country: "Sudan", translation: "السودان‎"},
	{country: "Syria", translation: "سوريا‎"},
	{country: "Tunisia", translation: "تونس‎"},
	{country: "Venezuela", translation: "Venezuela"},
	{country: "Yemen", translation: "اليمن‎"},
	{country: "Zimbabwe", translation: "Zimbabwe"},
];

/**
 * KYCTooltip Component
 * 
 * This component renders a tooltip that displays a list of countries
 * that are not allowed to pass KYC due to local regulations.
 * 
 * @param {TooltipProps} props - The props for the KYCTooltip component
 * @returns {JSX.Element} The rendered KYCTooltip component
 */
export const KYCTooltip = ({ width = 443, position = "center", side = "top", children }: TooltipProps): JSX.Element => {
    /**
     * Generates a three-column layout of countries
     * @returns {JSX.Element} The rendered list of countries
     */
    function getCountries(): JSX.Element {
        const countriesPerColumn = Math.ceil(countryList.length / 3);

        const columns = Array.from({ length: 3 }, (_, columnIndex) =>
            countryList.slice(columnIndex * countriesPerColumn, (columnIndex + 1) * countriesPerColumn)
        );

        return (
            <div className="flex w-full justify-between">
                {columns.map((column, columnIndex) => (
                    <ul key={columnIndex} className="flex flex-col flex-grow">
                        {column.map(({ country, translation }) => (
                            <li key={country} className="mx-2 text-[#A19F9F]">
                                <span className="text-[#FF0030]">*</span> {country} - {translation}
                            </li>
                        ))}
                    </ul>
                ))}
            </div>
        );
    }

    return (
        <TooltipPrimitive.Provider delayDuration={0}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    <button>{children}</button>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Content
                    align={position}
                    side={side}
                    sideOffset={12}
                    className={`relative -bottom-1 items-center flex-col flex text-black z-50`}
                    style={{ width: `${width}px` }}
                >
                    <div className={`relative w-full py-3 px-4 bg-[#000000] shadow-lg`}>
                        <p className="text-base font-semibold pb-2">
                            The following countries will not be allowed to pass KYC in accordance with local
                            regulations:
                        </p>
                        {getCountries()}
                    </div>
                    {/* Tooltip arrow */}
                    <div
                        className="w-3 h-3 -mt-[0.4rem] mx-[0.5rem] rotate-45 bg-[#000000] border-b border-r border-[#D4D4D4] z-30"
                    />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
};