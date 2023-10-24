import {useState} from "react";
import {AiFillWarning} from "react-icons/ai";
import {ActionsRequiredModal} from "./ActionsRequiredModal.tsx";
import {BuyKeysModal} from "../../../keys/modals/buy-keys/BuyKeysModal.tsx";
import {ViewKeysModal} from "../view-keys/ViewKeysModal.tsx";
import {ContinueInBrowserModal} from "../ContinueInBrowserModal.tsx";

export function ActionsRequiredModalManager() {
	const [number, setNumber] = useState<number>(0);

	const [showActionsModal, setShowActionsModal] = useState<boolean>(false);
	const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
	const [showViewModal, setShowViewModal] = useState<boolean>(false);
	const [showContinueInBrowserModal, setShowContinueInBrowserModal] = useState<boolean>(false);

	return (
		<div>
			{!showActionsModal && (
				<div className="absolute top-0 right-0 flex gap-4 bg-[#FFFBEB] p-2 m-2 z-10">
					<div className="flex flex-row gap-2 items-center">
						<AiFillWarning className="w-7 h-7 text-[#F59E28]"/>
						<span className="text-[#B45317] text-[15px] font-semibold">Actions required</span>
					</div>
					<button
						onClick={() => setShowActionsModal(true)}
						className={`flex flex-row justify-center items-center py-1 px-4 gap-1 bg-[#F30919] text-[15px] text-white font-semibold`}
					>
						Resolve
					</button>
				</div>
			)}

			{showActionsModal && (
				<ActionsRequiredModal
					setShowModal={setShowActionsModal}
					setShowBuyModal={setShowBuyModal}
					setShowViewModal={setShowViewModal}
				/>
			)}

			{showBuyModal && (
				<BuyKeysModal
					number={number}
					setNumber={setNumber}
					setShowModal={setShowBuyModal}
				/>
			)}

			{/*{showViewModal && (*/}
			{/*	<ViewKeysModal*/}
			{/*		setShowViewModal={setShowViewModal}*/}
			{/*		setShowContinueInBrowserModal={setShowContinueInBrowserModal}*/}
			{/*	/>*/}
			{/*)}*/}

			{showContinueInBrowserModal && (
				<ContinueInBrowserModal setShowContinueInBrowserModal={setShowContinueInBrowserModal}/>
			)}
		</div>
	);
}
