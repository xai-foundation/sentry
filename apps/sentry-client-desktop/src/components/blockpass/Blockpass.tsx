import {PropsWithChildren} from "react";

interface BlockpassProps {
	onClick?: () => void;
}

export function Blockpass({onClick = () => {}, children = "Begin KYC"}: PropsWithChildren<BlockpassProps>) {

	function onClickHelper() {
		onClick?.();
		document.getElementById("blockpass-kyc-connect")!.click();
	}

	return (
		<button
			className="w-full flex justify-center items-center gap-1 text-[15px] text-white bg-[#F30919] font-semibold mt-4 px-6 py-2"
			id="blockpass-kyc-connect"
			onClick={onClickHelper}
		>
			{children}
		</button>
	);
}

export function BlockPassKYC({onClick = () => {}, children = "Begin KYC"}: PropsWithChildren<BlockpassProps>) {

	function onClickHelper() {
		onClick?.();
		document.getElementById("blockpass-kyc-connect")!.click();
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
