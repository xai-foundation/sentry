import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {AiFillWarning} from "react-icons/ai";
import {useSetAtom} from "jotai";
import {useAccruingInfo} from "@/hooks/useAccruingInfo";

export function ActionsRequiredPromptHandler() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {accruing, kycRequired} = useAccruingInfo();

	if (!accruing || kycRequired) {
		return (
			<div className="flex gap-4 bg-[#FFFBEB] p-2 z-10">
				<div className="flex flex-row gap-2 items-center">
					<AiFillWarning className="w-7 h-7 text-[#F59E28]"/>
					<span
						className="text-[#B45317] text-[15px] font-semibold">Actions required (N A)</span>
				</div>
				<button
					onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
					className={`flex flex-row justify-center items-center py-1 px-4 gap-1 bg-[#F30919] text-[15px] text-white font-semibold`}
				>
					Resolve
				</button>
			</div>
		);
	}

	return null;
}
