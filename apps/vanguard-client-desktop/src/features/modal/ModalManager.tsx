import classNames from "classnames";
import {atom, useAtomValue} from "jotai";
import {ExitAlertModal} from "@/features/home/modals/ExitAlertModal";

export enum ModalView {
	Exit,
}

export const modalStateAtom = atom<ModalView | null>(null);

export function ModalManager() {
	const modalState = useAtomValue(modalStateAtom);

	return (
		<div
			className={classNames("w-[28rem] min-w-[28rem] h-screen relative z-10", {
				"hidden": modalState === null,
			})}
		>
			{modalState === ModalView.Exit && (
				<ExitAlertModal onSuccess={() => alert("wow")}/>
			)}

		</div>
	);
}
