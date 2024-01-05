import {HasKeys} from "./HasKeys.js";
import {NoKeys} from "./NoKeys.js";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";
import {useAtom, useAtomValue} from "jotai";
import {Tooltip} from "@sentry/ui";
import {RiKey2Line} from "react-icons/ri";
import {BiLoaderAlt} from "react-icons/bi";
import {chainStateAtom, useChainDataRefresh} from "@/hooks/useChainDataWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";
import {MdRefresh} from "react-icons/md";
import {ActionsRequiredPromptHandler} from "@/features/drawer/ActionsRequiredPromptHandler";

export type WalletAssignedMap = Record<string, boolean>;

export function Keys() {
	const {
		ownersLoading,
		owners,
		ownersKycLoading,
		ownersKycMap,
		licensesLoading,
		combinedLicensesMap,
		combinedLicensesList,
	} = useAtomValue(chainStateAtom);
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);
	const {combinedOwners, walletAssignedMap} = useCombinedOwners(owners);
	const keyCount = combinedLicensesList.length;
	const {refresh} = useChainDataRefresh();

	return (
		<div className="w-full h-screen">
			<div className="sticky top-0 bg-white flex flex-row justify-between items-center border-b border-gray-200 pl-10 pr-2 z-10">
				<div className="top-0 flex flex-row items-center h-16 gap-2 bg-white">
					<h2 className="text-lg font-semibold">Keys</h2>

					{licensesLoading ? (
						<div
							className="flex min-w-[128px] justify-center items-center text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500 gap-1">
							<BiLoaderAlt className="animate-spin" color={"#A3A3A3"}/>
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

					<a
						onClick={refresh}
						className="flex items-center text-[15px] text-[#F30919] gap-1 cursor-pointer font-light select-none"
					>
						<MdRefresh/> Refresh
					</a>

					<button
						className="flex justify-center items-center text-[15px] border border-[#E5E5E5] ml-2 py-2 px-3 gap-1"
						onClick={() => setDrawerState(DrawerView.BuyKeys)}
					>
						<RiKey2Line size={18}/>
						<p>Purchase keys</p>
					</button>
				</div>

				{drawerState === null && (
					<ActionsRequiredPromptHandler/>
				)}
			</div>

			{!ownersLoading && !ownersKycLoading && !licensesLoading && keyCount === 0 ? (
				<NoKeys/>
			) : (
				<>
					{Object.keys(combinedLicensesMap).length === 0 || keyCount === 0 ? (
						<div className="w-full h-full flex-1 flex flex-col justify-center items-center">
							<h3 className="text-center">Loading...</h3>
						</div>
					) : (
						<HasKeys
							combinedOwners={combinedOwners}
							combinedLicensesMap={combinedLicensesMap}
							statusMap={ownersKycMap}
							isWalletAssignedMap={walletAssignedMap}
						/>
					)}
				</>
			)}
		</div>
	)
}
