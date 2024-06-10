import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useAtomValue, useSetAtom} from "jotai";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {CustomTooltip, PrimaryButton} from "@sentry/ui";
import {AiFillWarning} from "react-icons/ai";
import {Card} from "@/features/home/cards/Card";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import { HelpIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { useOperatorRuntime } from "@/hooks/useOperatorRuntime";
import { RiKey2Line } from "react-icons/ri";

export function KeysCard() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {owners, licensesList} = useAtomValue(chainStateAtom);
	const {accruing} = useAtomValue(accruingStateAtom);
	const keyCount = licensesList.length;
	const { sentryRunning } = useOperatorRuntime();

	return (
		<Card width={"341px"} height={"279px"} customClasses="bg-primaryBgColor shadow-default overflow-visible z-10">
			<div className="flex flex-row justify-between items-center py-5 px-6 border-b border-primaryBorderColor">
				<div className="flex flex-row items-center gap-1 text-white text-2xl">
					<h2 className="font-bold">Keys</h2>
					<CustomTooltip
						header={"Purchased keys must be assigned to Sentry Wallet"}
						content={<>{"To assign keys, connect all wallets containing Sentry Keys."} <br/> {"The wallet containing the purchased keys will perform a gas transaction to assign the keys to the Sentry."} </>}
						position={"end"}
						>
						<HelpIcon width={14} height={14} fill="#A19F9F"/>
					</CustomTooltip>
				</div>
				<div className="flex flex-row justify-between items-center gap-1">
					<PrimaryButton
						className="text-btnPrimaryBgColor text-lg uppercase font-bold bg-trasparent rounded-md !px-0 !py-0 max-h-[28px] hover:!bg-primaryBgColor hover:text-white"
						onClick={() => setDrawerState(DrawerView.BuyKeys)}
						btnText="Buy Keys"
						colorStyle="primary"
						size='sm'
					/>
				</div>
			</div>
			<div className="py-4 px-6 flex">
				{sentryRunning && accruing && <div className="mr-3">
					<RiKey2Line size={30} color={"#ffffff"} />
				</div>}
				<div>
				<div className="flex gap-2 items-center">
					<p className="text-4xl font-bold text-white">
						{keyCount} {!accruing && (keyCount === 1 ? "key" : "keys")}
					</p>
				</div>
				{sentryRunning && <p className="text-lg text-secondaryText">
					In {owners.length} wallet{owners.length === 1 ? "" : "s"}
					</p>}
				</div>
			</div>

			{sentryRunning && !accruing && (
				<div
					className="absolute bottom-5 left-6 m-auto w-[288px] flex justify-center items-center gap-1 rounded-lg text-lg font-bold text-primaryTooltipColor bg-[#FFC53D1A] px-4 py-3 global-cta-clip-path">
					<div className="flex justify-center items-center gap-2">
						<AiFillWarning color={"#FFC53D"} size={25}/>
						You have unassigned keys
						<HelpIcon width={14} height={14} fill="#FFC53D"/>
					</div>
				</div>
			)}
		</Card>
	)
}
