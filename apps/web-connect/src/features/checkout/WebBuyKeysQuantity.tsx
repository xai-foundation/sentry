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
		<div className="flex w-full justify-end flex-row items-start gap-4 sm:mt-4 lg:mt-0">

			<div className="flex sm:w-full lg:w-[175px] sm:px-2 lg:px-0">
				<XaiNumberInput
					quantity={quantity}
					setQuantity={setQuantity}
					maxSupply={maxSupply}
				/>
			</div>
		</div>
	)
}
