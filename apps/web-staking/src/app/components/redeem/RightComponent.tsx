"use client";

import { RedXai } from "../icons/IconsComponent";

interface InputRightComponentProps {
	currency: string;
	availableXaiBalance?: number;
	onMaxBtnClick?: () => void;
}
export default function RightRedeemComponent({ currency, availableXaiBalance, onMaxBtnClick }: InputRightComponentProps) {
	return (
		<div className="flex flex-col min-w-fit">
			<div className="flex items-center justify-end lg:pb-3 sm:pb-4">
				<span className="mt-1 mr-1"><RedXai /></span>
				<span
					className={`ml-2 flex flex-col items-end lg:text-4xl sm:text-2xl font-semibold`}
				>{currency}</span>
			</div>
		</div>
	);
}
