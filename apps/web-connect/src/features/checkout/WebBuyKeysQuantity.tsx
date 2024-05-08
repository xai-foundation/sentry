import {XaiNumberInput} from "@sentry/ui";
import {Dispatch, SetStateAction} from "react";
import {useGetTotalSupplyAndCap} from "@/features/checkout/hooks/useGetTotalSupplyAndCap";

interface WebBuyKeysQuantityProps {
	quantity: number;
	setQuantity: Dispatch<SetStateAction<number>>;
}

export function WebBuyKeysQuantity({quantity, setQuantity}: WebBuyKeysQuantityProps) {
	const {data: getTotalData} = useGetTotalSupplyAndCap();
	const maxSupply = getTotalData ? Number(getTotalData.maxSupply) - Number(getTotalData.totalSupply) : 0;

	return (
		<div className="flex flex-row items-start gap-4">

			<div className="w-[175px]">
				<XaiNumberInput
					quantity={quantity}
					setQuantity={setQuantity}
					maxSupply={maxSupply}
				/>
			</div>
		</div>
	)
}
