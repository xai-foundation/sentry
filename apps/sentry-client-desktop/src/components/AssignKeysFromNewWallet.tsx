import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {BiLinkExternal} from "react-icons/bi";
import {useSetAtom} from "jotai";
import {AiFillWarning} from "react-icons/ai";
import {useOperator} from "@/features/operator";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {XaiButton} from "@sentry/ui";

export function AssignKeysFromNewWallet() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);
	const {isLoading: isOperatorLoading, publicKey: operatorAddress} = useOperator();

	function startAssignment() {
		setModalState(ModalView.TransactionInProgress);
		window.electron.openExternal(`https://sentry.xai.games/#/assign-wallet/${operatorAddress}`);
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

			<XaiButton
				onClick={startAssignment}
				disabled={isOperatorLoading}
				fontSize={"15px"}
			>
				Assign keys from new wallet
				<BiLinkExternal className="w-5 h-5"/>
			</XaiButton>

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
