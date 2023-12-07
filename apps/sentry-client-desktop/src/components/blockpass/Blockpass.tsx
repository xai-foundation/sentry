import {PropsWithChildren, useState} from "react";
import {CountryDropdown} from "@/components/blockpass/CountryDropdown";

interface BlockpassProps {
	onClick?: () => void;
}

export function Blockpass({onClick = () => {}, children = "Begin KYC"}: PropsWithChildren<BlockpassProps>) {
	const [selectedCountry, setSelectedCountry] = useState("");

	function onClickHelper() {
		if (selectedCountry) {
			if (
				selectedCountry === "BG" || //Bulgaria
				selectedCountry === "CN" || //China
				selectedCountry === "HK" || //Hong Kong
				selectedCountry === "MK" || //Macedonia
				selectedCountry === "RU" ||	//Russia
				selectedCountry === "TR" ||	//Turkey
				selectedCountry === "UA" 	//Ukraine
			) {
				onClick?.();
				return window.electron.openExternal(`https://verify-with.blockpass.org/?clientId=xai_sentry_node__edd_60145`);
			} else if (selectedCountry !== "") {
				onClick?.();
				return window.electron.openExternal(`https://verify-with.blockpass.org/?clientId=xai_node_007da`);
			}
		} else {
			console.log("Please select a country");
		}
	}

	return (
		<>
			<CountryDropdown
				selectedCountry={selectedCountry}
				setSelectedCountry={setSelectedCountry}
			/>
			<button
				className={`w-full flex justify-center items-center gap-1 text-[15px] font-semibold mt-2 px-6 py-2 ${!selectedCountry ? 'text-gray-500 bg-gray-300 cursor-not-allowed' : 'text-white bg-[#F30919]'}`}
				id="blockpass-kyc-connect"
				onClick={onClickHelper}
				disabled={!selectedCountry}
			>
				{children}
			</button>

		</>
	);
}

export function BlockPassKYC({onClick = () => {}, children = "Begin KYC"}: PropsWithChildren<BlockpassProps>) {
	function onClickHelper() {
		onClick?.();
	}

	return (
		<a
			className="text-[#F30919] cursor-pointer"
			id="blockpass-kyc-connect"
			onClick={onClickHelper}
		>
			{children}
		</a>
	);

}
