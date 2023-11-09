import {ChangeEvent, Dispatch, SetStateAction} from "react";
import {AiOutlineMinus, AiOutlinePlus} from "react-icons/ai";

interface XaiNumberInput {
	quantity: number;
	setQuantity: Dispatch<SetStateAction<number>>;
	maxSupply?: number;
}

export function XaiNumberInput({quantity, setQuantity, maxSupply = 50000}: XaiNumberInput) {
	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const numericInput = event.target.value.replace(/[^0-9]/g, "");
		let newAmount = parseInt(numericInput);

		if (isNaN(newAmount)) {
			newAmount = 1;
		} else if (newAmount < 1) {
			newAmount = 1;
		} else if (newAmount > maxSupply) {
			newAmount = maxSupply;
		}

		setQuantity(newAmount);
	};

	return (
		<div className="relative">
			<div
				onClick={() => quantity > 1 ? setQuantity(quantity - 1) : 1}
				className="absolute w-12 h-full flex justify-center items-center top-0 left-0 cursor-pointer select-none">
				<AiOutlineMinus/>
			</div>

			<input
				type="text"
				value={quantity}
				className="w-full h-12 border border-[#A3A3A3] text-center hover:cursor-text hover:bg-white hover:border-gray-300 hover:outline-none"
				onChange={handleInputChange}
			/>

			<div
				onClick={() => setQuantity(quantity < maxSupply ? quantity + 1 : maxSupply)}
				className="absolute w-12 h-full flex justify-center items-center top-0 right-0 cursor-pointer select-none">
				<AiOutlinePlus/>
			</div>
		</div>
	);
}
