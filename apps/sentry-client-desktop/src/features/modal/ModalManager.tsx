import classNames from "classnames";
import {atom, useAtom} from "jotai";
import {useState} from "react";
import {PurchaseCompleteModal} from "@/features/home/modals/PurchaseCompleteModal";
import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {AssignWalletTransactionInProgressModal} from "@/features/home/modals/AssignWalletTransactionInProgressModal";
import {useNavigate} from "react-router-dom";
import {DisableBodyModal} from "@/features/home/modals/DisableBodyModal";

export enum ModalView {
	PurchaseSuccessful,
	TransactionInProgress,
	RemoveWallet,
}

export const modalStateAtom = atom<ModalView | null>(null);

export function ModalManager() {
	const [modalState, setModalState] = useAtom(modalStateAtom);
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);
	const [purchaseSuccessful, setPurchaseSuccessful] = useState<{ show: boolean, txHash: string }>({show: false, txHash: ""});
	const navigate = useNavigate();

	// purchase success modal
	(window as any).deeplinks?.purchaseSuccessful((_event, txHash) => {
		navigate("/keys");
		setPurchaseSuccessful({show: true, txHash});
		setDrawerState(null);
		setModalState(ModalView.PurchaseSuccessful);
	});

	return (
		<div className={classNames("w-full h-full fixed z-10", {
			"hidden": modalState === null,
		})}>

			{modalState === ModalView.PurchaseSuccessful && (
				<PurchaseCompleteModal
					txHash={purchaseSuccessful.txHash}
				/>
			)}

			{modalState === ModalView.TransactionInProgress && (
				<AssignWalletTransactionInProgressModal/>
			)}

			{drawerState === DrawerView.Whitelist && (
				<DisableBodyModal/>
			)}
		</div>
	);
}
