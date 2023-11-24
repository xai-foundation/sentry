import {HasKeys} from "./HasKeys.js";
import {NoKeys} from "./NoKeys.js";
import {AiFillWarning, AiOutlineInfoCircle} from "react-icons/ai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";
import {useAtom, useAtomValue} from "jotai";
import {Tooltip} from "@/features/keys/Tooltip";
import {RiKey2Line} from "react-icons/ri";
import {BiLoaderAlt} from "react-icons/bi";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";

export type WalletAssignedMap = Record<string, boolean>;

export function Keys() {
	const {ownersLoading, owners, ownersKycLoading, ownersKycMap, licensesLoading, licensesMap, licensesList} = useAtomValue(chainStateAtom);
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);
	const {combinedOwners, walletAssignedMap} = useCombinedOwners(owners);
	const keyCount = licensesList.length;

	return (
		<div className="w-full h-screen">
			<div className="flex flex-row justify-between items-center border-b border-gray-200 pl-10 pr-2">
				<div className="top-0 flex flex-row items-center h-16 gap-2 bg-white">
					<h2 className="text-lg font-semibold">Keys</h2>

					{licensesLoading ? (
						<div className="flex min-w-[128px] justify-center items-center text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500 gap-1">
							<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} />
							<p>
								Loading...
							</p>
						</div>
					) : (
						<p className="flex min-w-[128px] justify-center items-center text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
							{keyCount} key{keyCount === 1 ? "" : "s"} in {combinedOwners.length} wallet{combinedOwners.length === 1 ? "" : "s"}
						</p>
					)}

					<Tooltip
						header={"Xai Client can track keys only from added wallets"}
						body={"If you own keys in additional wallets, add them to the client."}
						width={452}
					>
						<AiOutlineInfoCircle size={16} className="text-[#A3A3A3]"/>
					</Tooltip>

					<button
						className="flex justify-center items-center text-[15px] border border-[#E5E5E5] ml-2 py-2 px-3 gap-1"
						onClick={() => setDrawerState(DrawerView.BuyKeys)}
					>
						<RiKey2Line size={18}/>
						<p>Purchase keys</p>
					</button>
				</div>

				{drawerState === null && !ownersLoading && !ownersKycLoading && !licensesLoading && keyCount === 0 && (
					<div className="flex gap-4 bg-[#FFFBEB] p-2 z-10">
						<div className="flex flex-row gap-2 items-center">
							<AiFillWarning className="w-7 h-7 text-[#F59E28]"/>
							<span className="text-[#B45317] text-[15px] font-semibold">Actions required (Buy)</span>
						</div>
						<button
							onClick={() => setDrawerState(DrawerView.ActionsRequiredBuy)}
							className={`flex flex-row justify-center items-center py-1 px-4 gap-1 bg-[#F30919] text-[15px] text-white font-semibold`}
						>
							Resolve
						</button>
					</div>
				)}
			</div>

			{!ownersLoading && !ownersKycLoading && !licensesLoading && keyCount === 0 ? (
				<NoKeys/>
			) : (
				<>
					{Object.keys(licensesMap).length === 0 || keyCount === 0 ? (
						<div className="w-full h-full flex-1 flex flex-col justify-center items-center">
							<h3 className="text-center">Loading...</h3>
						</div>
					) : (
						<HasKeys
							licensesMap={licensesMap}
							statusMap={ownersKycMap}
							isWalletAssignedMap={walletAssignedMap}
						/>
					)}
				</>
			)}
		</div>
	)
}
