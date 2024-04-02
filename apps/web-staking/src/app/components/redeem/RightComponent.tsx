"use client";

import { RedXai } from "../icons/IconsComponent";

interface InputRightComponentProps {
	currency: string;
	availableXaiBalance?: number;
	onMaxBtnClick?: () => void;
}
export default function RightRedeemComponent({ currency, availableXaiBalance, onMaxBtnClick }: InputRightComponentProps) {
	return (
		<main className="flex w-full flex-col">
			<div className="flex flex-col items-end">
				<span className="flex text-2xl font-semibold">
					<span className="mt-1 mr-1"><RedXai /></span>
					{currency}
				</span>
			</div>
			
			<div className="flex flex-col items-end">
			{(availableXaiBalance || availableXaiBalance === 0) && (
					<span className="text-[12px] text-lightGrey unselectable">Available: {availableXaiBalance} {currency}
						<span className="text-[12px] text-red cursor-pointer" onClick={onMaxBtnClick}> Max</span>
				</span>
			) }
			</div>
		</main>
  	);
}
