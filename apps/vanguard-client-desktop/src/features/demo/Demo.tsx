import {useState} from "react";
import {Blockpass} from "../../components/blockpass/Blockpass.tsx";
import {PurchaseCompleteModal} from "../home/modals/PurchaseCompleteModal.tsx";

export function Demo() {
	// const [showConnectedModal, setShowConnectedModal] = useState<boolean>(false);
	const [showPurchaseCompleteModal, setShowPurchaseCompleteModal] = useState<boolean>(false);

	return (
		<div className="h-full flex justify-center items-center gap-4">
			{/*<button*/}
			{/*	onClick={() => setShowConnectedModal(true)}*/}
			{/*	className="w-auto h-auto bg-[#F30919] text-white p-4 uppercase font-semibold"*/}
			{/*>*/}
			{/*	Open Wallet Connected Modal*/}
			{/*</button>*/}

			<button
				onClick={() => setShowPurchaseCompleteModal(true)}
				className="w-auto h-auto bg-[#F30919] text-white p-4 uppercase font-semibold"
			>
				Open Purchase Complete Modal
			</button>

			<Blockpass/>

			{/*{showConnectedModal && (*/}
			{/*	<WalletConnectedModal*/}
			{/*		setShowConnectedModal={setShowConnectedModal}*/}
			{/*	/>*/}
			{/*)}*/}

			{showPurchaseCompleteModal && (
				<PurchaseCompleteModal
					setShowPurchaseCompleteModal={setShowPurchaseCompleteModal}
				/>
			)}
		</div>
	);
}
