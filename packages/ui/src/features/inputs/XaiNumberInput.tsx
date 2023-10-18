import {Dispatch, SetStateAction} from "react";
import {AiOutlineMinus, AiOutlinePlus} from "react-icons/ai";

interface XaiNumberInput {
	amount: number;
	setAmount: Dispatch<SetStateAction<number>>;
}

export function XaiNumberInput({amount, setAmount}: XaiNumberInput) {

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		// Remove non-numeric characters using a regular expression
		const numericInput = event.target.value.replace(/[^0-9]/g, "");
		setAmount(parseInt(numericInput));
	};

	return (
		<div className="relative">
			<span
				onClick={() => amount > 1 ? setAmount(amount - 1) : null}
				className="absolute top-4 left-4 cursor-pointer select-none">
				<AiOutlineMinus/>
			</span>

			<input
				type="text"
				value={amount || 0}
				className="w-full h-12 border border-[#A3A3A3] text-center hover:cursor-text hover:bg-white hover:border-gray-300 hover:outline-none"
				onChange={handleInputChange}
			/>

			<span
				onClick={() => setAmount(amount + 1)}
				className="absolute top-4 right-4 cursor-pointer select-none">
				<AiOutlinePlus/>
			</span>
		</div>
	);
}
