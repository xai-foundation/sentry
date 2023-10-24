import {ChangeEvent, Dispatch, SetStateAction, useState} from "react";
import {BiLinkExternal} from "react-icons/bi";

interface ActionsRequiredFlowProps {
	setAddWallet: Dispatch<SetStateAction<boolean>>;
	// setConnectWallet: Dispatch<SetStateAction<boolean>>;
}

export function ActionsRequiredFlow({setAddWallet}: ActionsRequiredFlowProps) {
	const [inputValue, setInputValue] = useState('');

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	return (
		<div className="w-full flex flex-col gap-8 mt-12">
			<div className="flex flex-col gap-2 px-6 pt-8">
				<span className="text-[15px] text-[#525252] mt-2">
					Enter the the public key of the wallet you want to view keys for
				</span>

				<input
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					className="w-full my-2 p-3 border rounded"
					placeholder="Enter public key"
				/>

				<button
					onClick={() => setAddWallet(true)}
					className="w-full h-12 flex flex-row justify-center items-center gap-1 bg-[#F30919] text-[15px] text-white font-semibold"
					// disabled={inputValue === ""}
				>
					Add wallet
				</button>

				<span className="text-[15px] text-[#525252] mt-8">
					Or connect wallet to view all keys in the wallet
				</span>

				<button
					onClick={() => window.electron.openExternal('http://localhost:7555/')}
					className="w-full h-12 flex flex-row justify-center items-center gap-1 bg-[#F30919] text-[15px] text-white font-semibold"
				>
					Connect wallet <BiLinkExternal/>
				</button>
			</div>
		</div>
	)
}
