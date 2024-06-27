import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {AiFillCheckCircle, AiFillWarning} from "react-icons/ai";
import {useSetAtom, useAtomValue} from "jotai";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useStorage} from "@/features/storage";
import BaseCallout from "@sentry/ui/dist/src/rebrand/callout/BaseCallout";
import {PrimaryButton} from "@sentry/ui";
import {WarningIcon} from "@sentry/ui/src/rebrand/icons/IconsComponents";

export function ActionsRequiredPromptHandler() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {accruing, kycRequired} = useAtomValue(accruingStateAtom);
	const {data} = useStorage();

	const {ownersLoading, ownersKycLoading, licensesLoading, combinedLicensesList} = useAtomValue(chainStateAtom);
	const keyCount = combinedLicensesList.length;

	if (!ownersLoading && !ownersKycLoading && !licensesLoading && keyCount === 0) {
		return (
			<BaseCallout extraClasses={{calloutWrapper: "h-[60px] w-[308px]"}} isWarning>
				<div className="flex flex-row gap-2 items-center mr-3">
					<WarningIcon width={23} height={20}/>
					<span className="text-bananaBoat text-lg font-bold !whitespace-nowrap">Actions required</span>
				</div>
				<div>
				<PrimaryButton
					onClick={() => setDrawerState(DrawerView.ActionsRequiredBuy)}
					className={`w-[104px] text-lg font-bold uppercase !py-1 !px-[14px]`}
					btnText="Resolve"
					size="sm"
					/>
				</div>
			</BaseCallout>
		)
	} else if (!accruing || data && data.whitelistedWallets && kycRequired) {
		return (
			<BaseCallout isWarning extraClasses={{calloutWrapper: "h-[60px] w-[308px] !py-0 !px-0", calloutFront: "!py-0 !px-0"}}>
				<div className="flex flex-row gap-2 items-center mr-3">
					<AiFillWarning className="w-7 h-7 text-[#FFC53D]"/>
					<span className="text-bananaBoat text-lg font-bold !text-nowrap">Actions required</span>
				</div>
				<PrimaryButton
					onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
					wrapperClassName="w-max"
					className={`flex flex-row max-w-[104px] justify-center items-center gap-1 !text-lg !font-bold !h-[40px] uppercase`}
					btnText={"Resolve"} />
			</BaseCallout>
		);
	} else {
		return (
			<div
				className="flex gap-4 !bg-drunkenDragonFly/10 global-cta-clip-path p-3 mr-2 z-10"
				onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
			>
				<div className="flex flex-row gap-2 items-center cursor-pointer">
					<AiFillCheckCircle className="w-6 h-6 text-drunkenDragonFly mt-1"/>
					<p className="text-lg text-drunkenDragonFly font-semibold">esXAI is being claimed</p>
				</div>
			</div>
		)
	}
}
