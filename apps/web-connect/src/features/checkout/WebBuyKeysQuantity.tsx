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
		<div className="flex flex-row items-center gap-4">
			<p className="text-sm uppercase text-[#A3A3A3]">
				Quantity
			</p>

			<div className="w-[200px]">
				<XaiNumberInput
					quantity={quantity}
					setQuantity={setQuantity}
					maxSupply={maxSupply}
				/>
			</div>
		</div>
	)
}
