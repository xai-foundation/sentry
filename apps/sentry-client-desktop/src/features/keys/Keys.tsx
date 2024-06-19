import {HasKeys} from "./HasKeys.js";
import {NoKeys} from "./NoKeys.js";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";
import {useAtom, useAtomValue} from "jotai";
import {CustomTooltip, PrimaryButton} from "@sentry/ui";
import {BiLoaderAlt} from "react-icons/bi";
import {chainStateAtom, useChainDataRefresh} from "@/hooks/useChainDataWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";
import {MdRefresh} from "react-icons/md";
import {ActionsRequiredPromptHandler} from "@/features/drawer/ActionsRequiredPromptHandler";
import { HelpIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents.js";

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
		<div className="pl-4 overflow-y-scroll no-scrollbar">
		<div className="w-full h-screen bg-nulnOil">
			<div className="sticky top-0 bg-nulnOil flex flex-row justify-between items-center border-b border-chromaphobicBlack pl-6 pr-2 z-40">
				<div className="top-0 flex flex-row items-center pt-[20px] pb-[18px] gap-2">
					<div className="flex items-start min-h-[43px]">
					<h2 className="text-3xl text-white font-bold">Keys</h2>
					</div>

					{licensesLoading ? (
						<div
							className="flex min-w-[128px] justify-center items-center text-lg text-elementalGrey gap-1">
							<BiLoaderAlt className="animate-spin" color={"#FF0030"}/>
							<p>
								Loading...
							</p>
						</div>
					) : (
						<p className="flex min-w-[128px] justify-center items-center text-lg text-elementalGrey pl-2">
							{keyCount} key{keyCount === 1 ? "" : "s"} in {combinedOwners.length} wallet{combinedOwners.length === 1 ? "" : "s"}
						</p>
					)}

					<CustomTooltip
						header={"Xai Client can track keys only from added wallets"}
						content={"If you own keys in additional wallets, add them to the client."}
						position="end"
						extraClasses={{tooltipText: "text-elementalGrey"}}
					>
						<HelpIcon width={14} height={14}/>
					</CustomTooltip>

					<a
						onClick={refresh}
						className="flex items-center text-lg text-hornetSting gap-1 cursor-pointer font-bold select-none hover:text-white duration-200 easy-in"
					>
						<MdRefresh/> Refresh
					</a>
                    <div className="ml-3">
					<PrimaryButton
						className={`text-xl uppercase font-bold !py-1 !px-[14px]`}
						onClick={() => setDrawerState(DrawerView.BuyKeys)}
						btnText="Purchase keys"
						colorStyle="outline"
						size="sm"
					/>
					</div>
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
							<h3 className="text-center text-lg text-white">Loading...</h3>
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
	</div>
	)
}
