import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {AiFillWarning} from "react-icons/ai";
import {useSetAtom} from "jotai";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {useBalance} from "@/hooks/useBalance";
import {useOperator} from "@/features/operator";
import {useListOwnersForOperatorWithCallback} from "@/hooks/useListOwnersForOperatorWithCallback";
import {useListNodeLicensesWithCallback} from "@/hooks/useListNodeLicensesWithCallback";
import {recommendedFundingBalance} from "@/features/home/SentryWallet";
import {useAccruing} from "@/hooks/useAccruing";

export function ActionsRequiredPromptHandler() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const accruing = useAccruing();

	if (!accruing) {
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
