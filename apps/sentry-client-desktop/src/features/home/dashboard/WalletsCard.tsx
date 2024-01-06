import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useAtomValue, useSetAtom} from "jotai";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";
import {Tooltip} from "@sentry/ui";
import {AiFillWarning, AiOutlineInfoCircle} from "react-icons/ai";
import {Card} from "@/features/home/cards/Card";
import {MdWallet} from "react-icons/md";

export function WalletsCard() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {owners} = useAtomValue(chainStateAtom);
	const {combinedOwners} = useCombinedOwners(owners);

	return (
		<Card width={"339px"} height={"187px"}>

			<div className="flex flex-row justify-between items-center py-2 px-4 border-b border-[#F5F5F5]">
				<div className="flex flex-row items-center gap-1 text-[#A3A3A3] text-[15px]">
					<h2 className="font-medium">Wallets</h2>
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
						className="flex flex-row justify-center items-center gap-2 text-[#737373] text-sm font-medium bg-[#F5F5F5] rounded-md px-4 py-1"
						onClick={() => setDrawerState(DrawerView.ViewKeys)}
					>
						Add wallet
					</button>
				</div>
			</div>

			<div className="py-2 px-4">
				<div className="flex gap-2 items-center">

				<div className="flex items-center gap-2">
					<div
						className="w-[24px] h-[24px] flex justify-center items-center bg-[#F5F5F5] rounded-full">
						<MdWallet color={"#A3A3A3"} size={15}/>
					</div>
				</div>
				<h3 className="text-[32px] font-semibold">
					{combinedOwners.length}
				</h3>
				</div>
				<p className="text-sm text-[#737373] ml-[2rem]">
					KYC complete: 0/{combinedOwners.length} (hard-coded)
				</p>
			</div>
			<div
				className="absolute bottom-3 left-3 m-auto max-w-[268px] h-[40px] flex justify-center items-center gap-1 rounded-lg text-sm text-[#F59E28] bg-[#FFFBEB] p-2">
				<div className="flex justify-center items-center gap-2">
					<AiFillWarning color={"#F59E28"} size={20}/>
					KYC required for 3 wallets
				</div>
			</div>
		</Card>
	)
}
