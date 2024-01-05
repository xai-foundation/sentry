import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useAtomValue, useSetAtom} from "jotai";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";
import {Tooltip} from "@sentry/ui";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {Card} from "@/features/home/cards/Card";

export function WalletsCard() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {owners} = useAtomValue(chainStateAtom);
	const {combinedOwners} = useCombinedOwners(owners);

	return (
		<Card width={"337.5px"} height={"187px"}>

			<div className="flex flex-row justify-between items-center py-2 px-4 border-b border-[#F5F5F5]">
				<div className="flex flex-row items-center gap-1 text-[#A3A3A3] text-[15px]">
					<h2>Wallets</h2>
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
						className="flex flex-row justify-center items-center gap-2 text-[#737373] text-[14px] font-semibold bg-[#F5F5F5] rounded-md px-4 py-1"
						onClick={() => setDrawerState(DrawerView.ViewKeys)}
					>
						Add wallet
					</button>
				</div>
			</div>

			<div className="py-2 px-4">
				<h3 className="text-[32px] font-semibold">
					{combinedOwners.length}
				</h3>
				<p className="text-[14px] text-[#737373]">
					KYC complete: 3/3
				</p>
			</div>

		</Card>
	)
}
