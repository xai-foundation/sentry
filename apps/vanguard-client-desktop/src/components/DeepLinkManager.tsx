import {WalletConnectedModal} from "../features/home/modals/WalletConnectedModal";
import {useState} from "react";

export function DeepLinkManager() {
	const [assignedWallet, setAssignedWallet] = useState<{show: boolean, txHash: string}>({show: false, txHash: ""});

	(window as any).deeplinks?.assignedWallet((_event, txHash) => {
		console.log("event:", _event);
		setAssignedWallet({show: true, txHash});
	});

	function onCloseWalletConnectedModal() {
		setAssignedWallet({show: false, txHash: ""});
	}

	return (
		<>
			{assignedWallet.show && (
				<WalletConnectedModal
					txHash={assignedWallet.txHash}
					onClose={onCloseWalletConnectedModal}
				/>
			)}
		</>
	);
}
