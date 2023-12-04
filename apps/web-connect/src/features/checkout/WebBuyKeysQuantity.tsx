import {Tooltip, XaiNumberInput} from "@sentry/ui";
import {Dispatch, SetStateAction} from "react";
import {useGetTotalSupplyAndCap} from "@/features/checkout/hooks/useGetTotalSupplyAndCap";
import {AiOutlineInfoCircle} from "react-icons/ai";

interface WebBuyKeysQuantityProps {
	quantity: number;
	setQuantity: Dispatch<SetStateAction<number>>;
}

export function WebBuyKeysQuantity({quantity, setQuantity}: WebBuyKeysQuantityProps) {
	const {data: getTotalData} = useGetTotalSupplyAndCap();
	const maxSupply = getTotalData ? Number(getTotalData.maxSupply) - Number(getTotalData.totalSupply) : 0;

	return (
		<div className="flex flex-row items-center gap-4">
			<div className="flex flex-row items-center gap-1">
				<p className="text-sm uppercase text-[#A3A3A3]">
					Quantity
				</p>
				<Tooltip
					body={"Purchases of keys that are larger than 50 will likely fail due to gas limits."}
					width={452}
				>
					<AiOutlineInfoCircle size={16} className="text-[#A3A3A3]"/>
				</Tooltip>
			</div>

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
