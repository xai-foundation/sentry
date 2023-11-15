import classNames from "classnames";
import {atom, useAtom, useSetAtom} from "jotai";
import {ExitAlertModal} from "@/features/home/modals/ExitAlertModal";
import {useState} from "react";
import {PurchaseCompleteModal} from "@/features/home/modals/PurchaseCompleteModal";
import {drawerStateAtom} from "@/features/drawer/DrawerManager";
import {AssignWalletTransactionInProgressModal} from "@/features/home/modals/AssignWalletTransactionInProgressModal";

export enum ModalView {
	Exit,
	PurchaseSuccessful,
	TransactionInProgress
}

export const modalStateAtom = atom<ModalView | null>(null);

export function ModalManager() {
	const [modalState, setModalState] = useAtom(modalStateAtom);
	const setDrawerState = useSetAtom(drawerStateAtom);
	const [purchaseSuccessful, setPurchaseSuccessful] = useState<{ show: boolean, txHash: string }>({show: false, txHash: ""});

	// un-assign wallet
	(window as any).deeplinks?.purchaseSuccessful((_event, txHash) => {
		setPurchaseSuccessful({show: true, txHash});
		setDrawerState(null);
		setModalState(ModalView.PurchaseSuccessful);
	});

	return (
		<div className={classNames("w-full h-full fixed z-10", {
			"hidden": modalState === null,
		})}>
			{modalState === ModalView.Exit && (
				<ExitAlertModal onSuccess={() => alert("wow")}/>
			)}

			{modalState === ModalView.PurchaseSuccessful && (
				<PurchaseCompleteModal
					txHash={purchaseSuccessful.txHash}
				/>
			)}

			{modalState === ModalView.TransactionInProgress && (
				<AssignWalletTransactionInProgressModal/>
			)}
		</div>
	);
}
