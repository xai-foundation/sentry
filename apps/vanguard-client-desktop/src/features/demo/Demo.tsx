import {WalletConnectedModal} from "../home/modals/WalletConnectedModal.tsx";
import {useState} from "react";
import {Blockpass} from "../../components/blockpass/Blockpass.tsx";

export function Demo() {
	const [showConnectedModal, setShowConnectedModal] = useState<boolean>(false);
	return (
		<div className="h-full flex justify-center items-center gap-4">
			<button
				onClick={() => setShowConnectedModal(true)}
				className="w-auto h-auto bg-[#F30919] text-white p-4 uppercase font-semibold"
			>
				Open Wallet Connected Modal
			</button>

			<Blockpass/>

			{showConnectedModal && (
				<WalletConnectedModal
					setShowConnectedModal={setShowConnectedModal}
				/>
			)}
		</div>
	)
}
