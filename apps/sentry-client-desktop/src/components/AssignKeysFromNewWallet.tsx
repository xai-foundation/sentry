import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {BiLinkExternal} from "react-icons/bi";
import {useSetAtom} from "jotai";
import {AiFillWarning} from "react-icons/ai";
import {useOperator} from "@/features/operator";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";

export function AssignKeysFromNewWallet() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);
	const {isLoading: isOperatorLoading, publicKey: operatorAddress} = useOperator();

	function startAssignment() {
		setModalState(ModalView.TransactionInProgress);
		window.electron.openExternal(`http://localhost:8080/assign-wallet/${operatorAddress}`);
	}

	return (
		<div className="flex flex-col justify-center items-center gap-4">
			<AiFillWarning className="w-16 h-16 text-[#F59E28]"/>
			<p className="text-2xl font-semibold">
				Keys not assigned
			</p>
			<p className="text-lg text-[#525252]">
				Add wallets to assign keys to the Sentry
			</p>

			<button
				onClick={startAssignment}
				disabled={isOperatorLoading}
				className="flex justify-center items-center gap-1 text-[15px] text-white bg-[#F30919] font-semibold mt-2 px-6 py-3"
			>
				Assign keys from new wallet
				<BiLinkExternal className="w-5 h-5"/>
			</button>

			<p className="text-[15px] text-[#525252] mt-2">
				Don't own any keys?

				<a
					onClick={() => setDrawerState(DrawerView.BuyKeys)}
					className="text-[#F30919] ml-1 cursor-pointer"
				>
					Purchase keys
				</a>
			</p>
		</div>
	);
}
