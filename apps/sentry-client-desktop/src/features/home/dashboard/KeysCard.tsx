import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useAtomValue, useSetAtom} from "jotai";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {Tooltip} from "@sentry/ui";
import {AiFillWarning, AiOutlineInfoCircle} from "react-icons/ai";
import {Card} from "@/features/home/cards/Card";
import {RiKey2Line} from "react-icons/ri";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";

export function KeysCard() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {owners, licensesList} = useAtomValue(chainStateAtom);
	const {accruing} = useAtomValue(accruingStateAtom);
	const keyCount = licensesList.length;

	return (
		<Card width={"355px"} height={"188px"}>
			<div className="flex flex-row justify-between items-center py-2 px-4 border-b border-[#F5F5F5]">
				<div className="flex flex-row items-center gap-1 text-[#A3A3A3] text-[15px]">
					<h2 className="font-medium">Keys</h2>
						<Tooltip
							header={"Purchased keys must be assigned to Sentry Wallet"}
							body={"To assign keys, connect all wallets containing Sentry Keys."}
							body2={"The wallet containing the purchased keys will perform a gas transaction to assign the keys to the Sentry."}
							position={"start"}
						>
						<AiOutlineInfoCircle size={15} color={"#A3A3A3"}/>
					</Tooltip>
				</div>
				<div className="flex flex-row justify-between items-center gap-1">
					<button
						className="flex flex-row justify-center items-center gap-2 text-[#737373] text-sm font-medium bg-[#F5F5F5] rounded-md px-4 py-1"
						onClick={() => setDrawerState(DrawerView.BuyKeys)}
					>
						Buy keys
					</button>
				</div>
			</div>
			<div className="py-2 px-4">
				<div className="flex gap-2 items-center">
					<div className="flex items-center gap-2">
						<div
							className="w-[24px] h-[24px] flex justify-center items-center bg-[#F5F5F5] rounded-full">
							<RiKey2Line color={"#A3A3A3"} size={15}/>
						</div>
					</div>
					<p className="text-[32px] font-semibold">
						{keyCount}
					</p>
				</div>
				<p className="text-sm text-[#737373] ml-[2rem]">
					In {owners.length} wallet{owners.length === 1 ? "" : "s"}
				</p>
			</div>

			{!accruing && (
				<div
					className="absolute bottom-3 left-3 m-auto max-w-[327px] h-[40px] flex justify-center items-center gap-1 rounded-lg text-sm text-[#F59E28] bg-[#FFFBEB] p-2">
					<div className="flex justify-center items-center gap-2">
						<AiFillWarning color={"#F59E28"} size={20}/>
						You have unassigned keys
					</div>
				</div>
			)}
		</Card>
	)
}
