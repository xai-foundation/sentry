import {useState} from "react";
import {ImportSentryAlertModal} from "@/features/home/modals/ImportSentryAlertModal";
import {useSetAtom} from "jotai";
import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {Tooltip} from "@/features/keys/Tooltip";
import {AiFillInfoCircle} from "react-icons/ai";

export function Demo() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const [showImportSentryAlertModal, setShowImportSentryAlertModal] = useState<boolean>(false);

	return (
		<div className="h-full flex justify-center items-center gap-4">

			<Tooltip
				header={"Sentry Wallet is encrypted on your device"}
				body={"This wallet is exportable and EVM compatible."}
			>
				<AiFillInfoCircle/>
			</Tooltip>

			<button
				onClick={() => setDrawerState(DrawerView.ActionsRequiredCompleteKyc)}
				className="w-auto h-auto bg-[#F30919] text-white p-4 uppercase font-semibold"
			>
				Open Actions
			</button>

			<button
				onClick={() => setShowImportSentryAlertModal(true)}
				className="w-auto h-auto bg-[#F30919] text-white p-4 uppercase font-semibold"
			>
				Open Import Sentry Alert Modal
			</button>

			{showImportSentryAlertModal && (
				<ImportSentryAlertModal
					setShowModal={setShowImportSentryAlertModal}
					onSuccess={() => alert("imported sentry!")}
				/>
			)}


		</div>
	);
}
