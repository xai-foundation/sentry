import {AiOutlineClose} from "react-icons/ai";
import {Dispatch, SetStateAction, useState} from "react";
import {BuyKeysSuccess} from "./BuyKeysSuccess.tsx";
import {BuyKeysFlow} from "./BuyKeysFlow.tsx";
import {drawerStateAtom} from "../../../drawer/DrawerManager";
import {useSetAtom} from "jotai";

interface BuyKeysModalProps {
	number: number;
	setNumber: Dispatch<SetStateAction<number>>;
	setShowModal: Dispatch<SetStateAction<boolean>>;
}

export function BuyKeysModal({number, setNumber, setShowModal}: BuyKeysModalProps) {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);

	return (
		<div className="w-full h-full flex flex-col justify-start items-center border border-gray-200 z-20 bg-white">
			<div
				className="w-full h-16 flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
				<span>Purchase key</span>
				<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
					<AiOutlineClose/>
				</div>
			</div>

			{purchaseSuccess ? (
				<BuyKeysSuccess
					number={number}
					setNumber={setNumber}
					setShowModal={setShowModal}
				/>
			) : (
				<BuyKeysFlow
					setPurchaseSuccess={setPurchaseSuccess}
				/>
			)}
		</div>
	)
}
