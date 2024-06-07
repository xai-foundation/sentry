import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {AiFillCheckCircle, AiFillWarning} from "react-icons/ai";
import {useSetAtom, useAtomValue} from "jotai";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useStorage} from "@/features/storage";
import BaseCallout from "@sentry/ui/dist/src/rebrand/callout/BaseCallout";
import {PrimaryButton} from "@sentry/ui";

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
			<BaseCallout extraClasses={{calloutWrapper: "h-[60px] w-[308px]", calloutFront: "bg-primaryCalloutWarning "}}>
				<div className="flex flex-row gap-2 items-center mr-3">
					<AiFillWarning className="w-7 h-7 text-[#F59E28]"/>
					<span className="text-primaryWarningText text-lg font-bold ">Actions required</span>
				</div>
				<PrimaryButton
					onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
					wrapperClassName="w-max"
					className={`flex flex-row max-w-[104px] justify-center items-center gap-1 bg-[#F30919] !text-lg !font-bold text-white !h-[40px] uppercase`}
					btnText={"Resolve"} />
			</BaseCallout>
		);
	} else {
		return (
			<div
				className="flex gap-4 bg-successBgColor global-cta-clip-path p-3 mr-2 z-10"
				onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
			>
				<div className="flex flex-row gap-2 items-center cursor-pointer">
					<AiFillCheckCircle className="w-6 h-6 text-successText mt-1"/>
					<p className="text-lg text-successText font-semibold">esXAI is being claimed</p>
				</div>
			</div>
		)
	}
}
