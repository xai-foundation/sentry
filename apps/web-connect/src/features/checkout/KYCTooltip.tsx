import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {PropsWithChildren} from "react";

interface TooltipProps extends PropsWithChildren {
	width?: number;
	position?: "start" | "center" | "end";
	side?: "top" | "right" | "bottom" | "left";
}

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

export const KYCTooltip = ({width = 443, position = "center", side = "top", children}: TooltipProps) => {
	function getCountries() {

		const countriesPerColumn = Math.ceil(countryList.length / 3); // Calculate the number of countries per column

		const columns = Array.from({length: 3}, (_, columnIndex) =>
			countryList.slice(columnIndex * countriesPerColumn, (columnIndex + 1) * countriesPerColumn)
		);

		// Render the columns
		return (
			<div className="flex w-full justify-between">
				{columns.map((column, columnIndex) => (
					<ul key={columnIndex} className="flex flex-col flex-grow">
						{column.map(({country, translation}) => (
							<li key={country} className="mx-2">
								{country} - {translation}
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
					style={{width: `${width}px`}}
				>
					<div className={`relative w-full py-3 px-4 bg-white border border-[#D4D4D4] shadow-lg`}>
						<p className="text-base font-semibold pb-2">
							The following countries will not be allowed to pass KYC in accordance with local
							regulations:
						</p>
						{getCountries()}
					</div>
					<div
						className="w-3 h-3 -mt-[0.4rem] mx-[0.5rem] rotate-45 bg-white border-b border-r border-[#D4D4D4] z-30"/>
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
};
