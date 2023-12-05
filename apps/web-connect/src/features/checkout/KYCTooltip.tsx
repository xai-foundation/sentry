import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {PropsWithChildren} from "react";

interface TooltipProps extends PropsWithChildren {
	width?: number;
	position?: "start" | "center" | "end";
	side?: "top" | "right" | "bottom" | "left";
}

const countryList: { country: string; translation: string }[] = [
	{ country: "Belarus", translation: "Беларусь" },
	{ country: "Afghanistan", translation: "افغانستان‎" },
	{ country: "Central African Republic", translation: "République centrafricaine" },
	{ country: "Myanmar", translation: "Burma" },
	{ country: "Cuba", translation: "Cuba" },
	{ country: "Congo (DRC)", translation: "Jamhuri ya Kidemokrasia ya Kongo" },
	{ country: "Ethiopia", translation: "Ethiopia" },
	{ country: "Iran", translation: "ایران‎" },
	{ country: "Iraq", translation: "العراق‎" },
	{ country: "Lebanon", translation: "لبنان‎" },
	{ country: "Libya", translation: "ليبيا‎" },
	{ country: "Mali", translation: "Mali" },
	{ country: "Nicaragua", translation: "Nicaragua" },
	{ country: "Russia", translation: "Россия" },
	{ country: "Somalia", translation: "Soomaaliya" },
	{ country: "South Sudan", translation: "جنوب السودان‎" },
	{ country: "Sudan", translation: "السودان‎" },
	{ country: "Syria", translation: "سوريا‎" },
	{ country: "Ukraine", translation: "Україна" },
	{ country: "Venezuela", translation: "Venezuela" },
	{ country: "Zimbabwe", translation: "Zimbabwe" },
	{ country: "United States", translation: "United States" },
	{ country: "Macedonia (FYROM)", translation: "Македонија" },
	{ country: "Romania", translation: "România" },
	{ country: "Montenegro", translation: "Crna Gora" },
	{ country: "Kosovo", translation: "Kosovo" },
	{ country: "Bosnia and Herzegovina", translation: "Босна и Херцеговина" },
	{ country: "Serbia", translation: "Србија" },
	{ country: "Croatia", translation: "Hrvatska" },
	{ country: "Greece", translation: "Ελλάδα" },
	{ country: "Bulgaria", translation: "България" },
	{ country: "Albania", translation: "Shqipëri" },
	{ country: "Slovenia", translation: "Slovenija" },
	{ country: "Burundi", translation: "Uburundi" },
	{ country: "North Korea", translation: "조선 민주주의 인민 공화국" },
	{ country: "Guinea", translation: "Guinée" },
	{ country: "Guinea-Bissau", translation: "Guiné Bissau" },
	{ country: "Haiti", translation: "Haiti" },
	{ country: "Moldova", translation: "Republica Moldova" },
	{ country: "Tunisia", translation: "تونس‎" },
	{ country: "Yemen", translation: "اليمن‎" },
];

export const KYCTooltip = ({width = 443, position = "start", side = "top", children}: TooltipProps) => {

	function getCountries(){
		return (
			<ul>
				{countryList.map(({ country, translation }) => (
					<li key={country}>
						{country} - {translation}
					</li>
				))}
			</ul>
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
					className={`relative -bottom-1 ${position === "start" ? "left-[-0.39rem] items-start" : "right-[-0.39rem] items-end"} flex-col flex text-black z-50`}
					style={{width: `${width}px`}}
				>
					<div className={`relative w-full py-3 px-4 bg-white border border-[#D4D4D4] shadow-lg`}>
						<p className="text-base font-semibold pb-2">
							The following countries will not be allowed to pass KYC in accordance with local regulations:
						</p>
						{getCountries()}
					</div>
					<div className="w-3 h-3 -mt-[0.4rem] mx-[0.5rem] rotate-45 bg-white border-b border-r border-[#D4D4D4] z-30"/>
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
};
