import {WalletConnectedModal} from "../home/modals/WalletConnectedModal.tsx";
import {useState} from "react";

export function Demo() {
	const [showConnectedModal, setShowConnectedModal] = useState<boolean>(false);
	return (
		<div className="h-full flex justify-center items-center">
			<button
				onClick={() => setShowConnectedModal(true)}
				className="w-auto h-auto bg-[#F30919] text-sm text-white p-4 uppercase font-semibold"
			>
				Open Wallet Connected Modal
			</button>

			{showConnectedModal && (
				<WalletConnectedModal
					setShowConnectedModal={setShowConnectedModal}
				/>
			)}
		</div>
	)
}
