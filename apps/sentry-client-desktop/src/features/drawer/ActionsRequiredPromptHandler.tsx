import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {AiFillCheckCircle, AiFillWarning} from "react-icons/ai";
import {useSetAtom, useAtomValue} from "jotai";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useStorage} from "@/features/storage";

export function ActionsRequiredPromptHandler() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {accruing, kycRequired} = useAtomValue(accruingStateAtom);
	const {data} = useStorage();

	const {ownersLoading, ownersKycLoading, licensesLoading, combinedLicensesList} = useAtomValue(chainStateAtom);
	const keyCount = combinedLicensesList.length;

	if (!ownersLoading && !ownersKycLoading && !licensesLoading && keyCount === 0) {
		return (
			<div className="flex gap-4 bg-[#FFFBEB] p-2 z-10">
				<div className="flex flex-row gap-2 items-center">
					<AiFillWarning className="w-7 h-7 text-[#F59E28]"/>
					<span className="text-[#B45317] text-[15px] font-semibold">Actions required</span>
				</div>
				<button
					onClick={() => setDrawerState(DrawerView.ActionsRequiredBuy)}
					className={`flex flex-row justify-center items-center py-1 px-4 gap-1 bg-[#F30919] text-[15px] text-white font-semibold`}
				>
					Resolve
				</button>
			</div>
		)
	} else if (!accruing || data && data.whitelistedWallets && kycRequired) {
		return (
			<div className="flex gap-4 bg-[#FFFBEB] p-2 z-10">
				<div className="flex flex-row gap-2 items-center">
					<AiFillWarning className="w-7 h-7 text-[#F59E28]"/>
					<span className="text-[#B45317] text-[15px] font-semibold">Actions required</span>
				</div>
				<button
					onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
					className={`flex flex-row justify-center items-center py-1 px-4 gap-1 bg-[#F30919] text-[15px] text-white font-semibold`}
				>
					Resolve
				</button>
			</div>
		);
	} else {
		return (
			<div
				className="flex gap-4 bg-[#DCFCE7] p-3 mr-2 z-10"
				onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
			>
				<div className="flex flex-row gap-2 items-center cursor-pointer">
					<AiFillCheckCircle className="w-5 h-5 text-[#16A34A] mt-1"/>
					<p className="text-[15px] font-semibold">esXAI is being claimed</p>
				</div>
			</div>
		)
	}
}
