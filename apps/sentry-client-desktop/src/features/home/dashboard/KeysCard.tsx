import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useAtomValue, useSetAtom} from "jotai";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";
import {useOperator} from "@/features/operator";
import {Tooltip} from "@sentry/ui";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {Card} from "@/features/home/cards/Card";
import {RiKey2Line} from "react-icons/ri";

export function KeysCard() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {owners, combinedLicensesList} = useAtomValue(chainStateAtom);
	const {combinedOwners} = useCombinedOwners(owners);
	const keyCount = combinedLicensesList.length;
	const {publicKey: operatorAddress} = useOperator();

	return (
		<Card width={"337.5px"} height={"187px"}>
			<div className="flex flex-row justify-between items-center py-2 px-4 border-b border-[#F5F5F5]">
				<div className="flex flex-row items-center gap-1 text-[#A3A3A3] text-[15px]">
					<h2 className="font-medium">Keys</h2>

					<Tooltip
						header={"Header"}
						body={"Body"}
						position={"start"}
					>
						<AiOutlineInfoCircle size={15} color={"#A3A3A3"}/>
					</Tooltip>
				</div>
				<div className="flex flex-row justify-between items-center gap-1">
					<button
						className="flex flex-row justify-center items-center gap-2 text-[#737373] text-[14px] font-medium bg-[#F5F5F5] rounded-md px-4 py-1"
						onClick={() => setDrawerState(DrawerView.BuyKeys)}
					>
						Buy keys
					</button>
					<button
						className="flex flex-row justify-center items-center gap-2 text-[#737373] text-[14px] font-medium bg-[#F5F5F5] rounded-md px-4 py-1"
						onClick={() => window.electron.openExternal(`https://sentry.xai.games/#/assign-wallet/${operatorAddress}`)}
					>
						Assign keys
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
				<p className="text-[14px] text-[#737373] ml-[2rem]">
					In {combinedOwners.length} wallet{combinedOwners.length === 1 ? "" : "s"}
				</p>
			</div>
		</Card>
	)
}
