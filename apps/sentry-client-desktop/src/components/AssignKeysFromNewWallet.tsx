import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useSetAtom} from "jotai";
import {useOperator} from "@/features/operator";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {PrimaryButton} from "@sentry/ui";
import {WarningIcon} from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";

export function AssignKeysFromNewWallet() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);
	const {isLoading: isOperatorLoading, publicKey: operatorAddress} = useOperator();

	function startAssignment() {
		setModalState(ModalView.TransactionInProgress);
		window.electron.openExternal(`https://sentry.xai.games/#/assign-wallet/${operatorAddress}`);
	}

	return (
		<div className="flex flex-col justify-center items-center ">
			<WarningIcon width={64} height={55} />
			<p className="text-3xl font-bold uppercase text-white mt-[26px] mb-[13px]">
				Keys not assigned
			</p>
			<p className="text-lg font-medium text-secondaryText mb-[13px]">
				Add wallets to assign keys to the Sentry
			</p>

			<PrimaryButton
				onClick={startAssignment}
				isDisabled={isOperatorLoading}
				wrapperClassName="w-max global-cta-clip-path"
				btnText={"Assign keys from new wallet"}
				className="h-[56px] w-[307px] uppercase !text-xl !font-bold !px-0"
			/>


			<p className="text-lg font-medium text-secondaryText mt-[27px]">
				Don't own any keys?

				<a
					onClick={() => setDrawerState(DrawerView.BuyKeys)}
					className="text-tertiaryText font-bold text-lg ml-1 cursor-pointer"
				>
					Purchase keys
				</a>
			</p>
		</div>
	);
}
