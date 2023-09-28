import {AiOutlineClose} from "react-icons/ai";
import {Dispatch, SetStateAction, useState} from "react";
import {BuyLicenseSuccess} from "./BuyLicenseSuccess.tsx";
import {BuyLicenseFlow} from "./BuyLicenseFlow.tsx";

interface BuyLicenseModalProps {
	number: number;
	setNumber: Dispatch<SetStateAction<number>>;
	setShowModal: Dispatch<SetStateAction<boolean>>;
}

export function BuyLicenseModal({number, setNumber, setShowModal}: BuyLicenseModalProps) {
	const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);

	return (
		<div
			className="absolute top-0 right-0 w-[30rem] h-screen flex flex-col justify-start items-center border border-gray-200 p-8 z-20 bg-white">
			<div
				className="absolute top-0 w-full h-16 flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
				<span>Buy license</span>
				<div className="cursor-pointer" onClick={() => setShowModal(false)}>
					<AiOutlineClose/>
				</div>
			</div>

			{purchaseSuccess ? (
				<BuyLicenseSuccess
					number={number}
					setNumber={setNumber}
					setShowModal={setShowModal}
				/>
			) : (
				<BuyLicenseFlow
					setPurchaseSuccess={setPurchaseSuccess}
				/>
			)}
		</div>
	)
}
