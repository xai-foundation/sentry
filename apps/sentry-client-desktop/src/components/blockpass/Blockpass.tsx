import {PropsWithChildren, useState} from "react";
import {CountryDropdown} from "@/components/blockpass/CountryDropdown";
import log from "electron-log";
import { RiArrowDropDownLine } from "react-icons/ri";

interface BlockpassProps {
	onClick?: () => void;
}

export function Blockpass({onClick = () => {}, children = "Begin KYC"}: PropsWithChildren<BlockpassProps>) {
	const [selectedCountry, setSelectedCountry] = useState("");

	function onClickHelper() {
		if (selectedCountry) {
			if (
				selectedCountry === "CN" || //China
				selectedCountry === "HK" || //Hong Kong
				selectedCountry === "MK" || //Macedonia
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
			log.info("Please select a country");
		}
	}

	return (
		<div className="relative">
			<CountryDropdown
				selectedCountry={selectedCountry}
				setSelectedCountry={setSelectedCountry}
			/>
			<div className="absolute top-2 right-4 text-white pointer-events-none">
				<RiArrowDropDownLine size={40}/>
			</div>
			<div className="pl-7">
			<button
				className={`w-[280px] flex justify-center items-center gap-1 text-lg uppercase font-bold mt-2 px-6 py-2 global-clip-primary-btn ${!selectedCountry ? 'bg-[#2A2828] text-[#726F6F] text-bold cursor-not-allowed' : 'text-white bg-[#F30919] hover:text-hornetSting hover:bg-white cursor-pointer duration-200 easy-in'}`}
				id="blockpass-kyc-connect"
				onClick={onClickHelper}
				disabled={!selectedCountry}
			>
				{children}
			</button>
			</div>
		</div>
	);
}

export function BlockPassKYC({onClick = () => {}, children = "Begin KYC"}: PropsWithChildren<BlockpassProps>) {
	function onClickHelper() {
		onClick?.();
	}

	return (
		<a
			className="text-[#F30919] cursor-pointer hover:text-white duration-200 ease-in"
			id="blockpass-kyc-connect"
			onClick={onClickHelper}
		>
			{children}
		</a>
	);

}
