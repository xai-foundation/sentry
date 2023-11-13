import {useState} from "react";
import {Blockpass} from "@/components/blockpass/Blockpass";
import {RemoveWalletModal} from "@/features/home/modals/RemoveWalletModal";
import {ImportSentryAlertModal} from "@/features/home/modals/ImportSentryAlertModal";

export function Demo() {
	const [showRemoveWalletModal, setShowRemoveWalletModal] = useState<boolean>(false);
	const [showImportSentryAlertModal, setShowImportSentryAlertModal] = useState<boolean>(false);

	return (
		<div className="h-full flex justify-center items-center gap-4">
			<button
				onClick={() => setShowImportSentryAlertModal(true)}
				className="w-auto h-auto bg-[#F30919] text-white p-4 uppercase font-semibold"
			>
				Open Import Sentry Alert Modal
			</button>

			<button
				onClick={() => setShowRemoveWalletModal(true)}
				className="w-auto h-auto bg-[#F30919] text-white p-4 uppercase font-semibold"
			>
				Open Remove Wallet Modal
			</button>

			<Blockpass/>

			{showImportSentryAlertModal && (
				<ImportSentryAlertModal
					setShowModal={setShowImportSentryAlertModal}
					onSuccess={() => alert("imported sentry!")}
				/>
			)}

			{showRemoveWalletModal && (
				<RemoveWalletModal
					setShowModal={setShowRemoveWalletModal}
					onSuccess={() => alert("removed wallet!")}
				/>
			)}
		</div>
	);
}
