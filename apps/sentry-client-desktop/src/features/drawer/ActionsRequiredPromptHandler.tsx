import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {AiFillCheckCircle, AiFillWarning} from "react-icons/ai";
import {useSetAtom, useAtomValue} from "jotai";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useStorage} from "@/features/storage";
import { WarningIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { PrimaryButton } from "@sentry/ui";

export function ActionsRequiredPromptHandler() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {accruing, kycRequired} = useAtomValue(accruingStateAtom);
	const {data} = useStorage();

	const {ownersLoading, ownersKycLoading, licensesLoading, combinedLicensesList} = useAtomValue(chainStateAtom);
	const keyCount = combinedLicensesList.length;

	if (!ownersLoading && !ownersKycLoading && !licensesLoading && keyCount === 0) {
		return (
			<div className="flex gap-4 bg-[#FFC53D1A] py-2 px-4 z-10 global-cta-clip-path">
				<div className="flex flex-row gap-2 items-center">
					<WarningIcon width={23} height={20}/>
					<span className="text-primaryTooltipColor text-lg font-bold">Actions required</span>
				</div>
				<div>
				<PrimaryButton
					onClick={() => setDrawerState(DrawerView.ActionsRequiredBuy)}
					className={`bg-btnPrimaryBgColor w-[104px] text-lg text-white font-bold uppercase !py-1 !px-[14px] hover:text-btnPrimaryBgColor`}
					btnText="Resolve"
					size="sm"
					/>
				</div>
			</div>
		)
	} else if (!accruing || data && data.whitelistedWallets && kycRequired) {
		return (
			<div className="flex gap-4 bg-[#FFC53D1A] py-2 px-4 z-10 global-cta-clip-path">
				<div className="flex flex-row gap-2 items-center">
					<WarningIcon width={23} height={20}/>
					<span className="text-primaryTooltipColor text-lg font-bold">Actions required</span>
				</div>
				<div>
				<PrimaryButton
					onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
					className={`bg-btnPrimaryBgColor w-[104px] text-lg text-white font-bold uppercase !py-1 !px-[14px] hover:text-btnPrimaryBgColor`}
					btnText="Resolve"
					size="sm"
				/>
				</div>
			</div>
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
