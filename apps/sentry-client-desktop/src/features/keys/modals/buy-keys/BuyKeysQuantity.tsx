import {XaiNumberInput} from "@sentry/ui";
import {useGetTotalSupplyAndCap} from "@/features/keys/hooks/useGetTotalSupplyAndCap";

interface BuyKeysQuantityProps {
	quantity: number;
	setQuantity: (quantity: number) => void;
}

export function BuyKeysQuantity({quantity, setQuantity}: BuyKeysQuantityProps) {
	const {data: getTotalData} = useGetTotalSupplyAndCap();
	const maxSupply = getTotalData ? Number(getTotalData.maxSupply) - Number(getTotalData.totalSupply) : 0;

	return (
		<div>
			<div className="w-full flex flex-col gap-4 px-6">
				<div className="w-full flex flex-row items-center gap-2">
					<span className="w-20 text-sm uppercase text-[#A3A3A3]">
						Quantity
					</span>
				</div>

				<div>
					<XaiNumberInput
						quantity={quantity}
						setQuantity={setQuantity}
						maxSupply={maxSupply}
					/>
				</div>
			</div>
		</div>
	)
}
