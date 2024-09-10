import { AiOutlineCheck } from "react-icons/ai";
import { ReactNode, useState } from "react";
import { BiDownload, BiLoaderAlt, BiUpload } from "react-icons/bi";
import { useOperator } from "../operator";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { MdRefresh } from "react-icons/md";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { drawerStateAtom, DrawerView } from "../drawer/DrawerManager.js";
import { FaPlay } from "react-icons/fa6";
import { AssignKeysFromNewWallet } from "@/components/AssignKeysFromNewWallet";
import { WalletConnectedModal } from "@/features/home/modals/WalletConnectedModal";
import { WalletDisconnectedModal } from "@/features/home/modals/WalletDisconnectedModal";
import { useQueryClient } from "react-query";
import { ethers } from "ethers";
import { useOperatorRuntime } from "@/hooks/useOperatorRuntime";
import { CustomTooltip } from "@sentry/ui";
import { modalStateAtom } from "@/features/modal/ModalManager";
import { ActionsRequiredPromptHandler } from "@/features/drawer/ActionsRequiredPromptHandler";
import { SentryWalletHeader } from "@/features/home/SentryWalletHeader";
import { chainStateAtom, useChainDataRefresh } from "@/hooks/useChainDataWithCallback";
import { accruingStateAtom } from "@/hooks/useAccruingInfo";
import { AssignKeysSentryNotRunning } from "@/components/AssignKeysSentryNotRunning";
import log from "electron-log";
import { GreenPulse, GreyPulse, YellowPulse } from "@/features/keys/StatusPulse";
import BaseCallout from "@sentry/ui/dist/src/rebrand/callout/BaseCallout";
import { CopyIcon, HelpIcon } from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";
import { SentryWalletTableBody } from "@/features/home/SentryWalletTableBody";
import { useBalance } from "@/hooks/useBalance";
import { InfoBanner } from "@/components/InfoBanner";

// TODO -> replace with dynamic value later
export const recommendedFundingBalance = ethers.parseEther("0.005");

export function SentryWallet() {
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);
	const { ownersLoading, owners, pools, licensesLoading, operatorWalletData, totalAssignedKeys } = useAtomValue(chainStateAtom);

	const queryClient = useQueryClient();
	const { hasAssignedKeys, funded } = useAtomValue(accruingStateAtom);

	const { isLoading: operatorLoading, publicKey: operatorAddress } = useOperator();
	// const {data: balance} = useBalance(operatorAddress);

	const loading = operatorLoading || ownersLoading || licensesLoading;

	const [copied, setCopied] = useState<boolean>(false);
	const [assignedWallet, setAssignedWallet] = useState<{ show: boolean, txHash: string }>({ show: false, txHash: "" });
	const [unassignedWallet, setUnassignedWallet] = useState<{ show: boolean, txHash: string }>({
		show: false,
		txHash: ""
	});
	const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState<boolean>(false); // dropdown state
	const { startRuntime, stopRuntime, sentryRunning, sentryAddressStatusMap } = useOperatorRuntime();

	const { refresh } = useChainDataRefresh();

	const { publicKey } = useOperator();
	const { isFetching: isBalanceLoading } = useBalance(publicKey);

	function onRefreshEthBalance() {
		void queryClient.invalidateQueries({ queryKey: ["balance", publicKey] });
	}

	// assign wallet
	(window as any).deeplinks?.assignedWallet((_event, txHash) => {
		setModalState(null)
		setAssignedWallet({ show: true, txHash });
	});

	// un-assign wallet
	(window as any).deeplinks?.unassignedWallet((_event, txHash) => {
		setModalState(null)
		setUnassignedWallet({ show: true, txHash });
	});

	function copyPublicKey() {
		if (operatorAddress && navigator.clipboard) {
			navigator.clipboard.writeText(operatorAddress)
				.then(() => {
					setCopied(true);
					setTimeout(() => {
						setCopied(false);
					}, 2000);
				})
				.catch(err => {
					log.error('Unable to copy to clipboard: ', err);
				});
		} else {
			log.error('Clipboard API not available, unable to copy to clipboard');
		}
	}

	function getAssignedWalletCount() {
		let operatorWalletCount = 0;

		sentryAddressStatusMap.forEach(sentryStatus => {
			if(sentryStatus.keyCount > 0){
				operatorWalletCount++;
			}
		});

		return operatorWalletCount;
	}

	function getAssignedKeysCount() {
		let operatorKeyCount = 0;

		sentryAddressStatusMap.forEach(sentryStatus => {
			operatorKeyCount += Number(sentryStatus.keyCount);
		})

		return operatorKeyCount;
	}

	function onCloseWalletConnectedModal() {
		setAssignedWallet({ show: false, txHash: "" });
		setUnassignedWallet({ show: false, txHash: "" });
		refresh();
		void queryClient.invalidateQueries({ queryKey: ["ownersForOperator", operatorAddress] });
	}

	function getOperatorWallets() {
		const operatorWallets: string[] = pools.concat(owners);
		if(operatorAddress){
			operatorWallets.push(operatorAddress);
		}
		return operatorWallets;
	}

	function TableComponent(): ReactNode {
		return (<table className="w-full">
			<thead className="text-elementalGrey text-base sticky top-0 bg-nulnOil z-10">
				<tr className="flex items-center text-left text-lg border-b border-t border-chromaphobicBlack pl-[16px] py-[14px] bg-dynamicBlack">
					<th className="min-w-[26%] px-2 py-0 font-semibold">WALLET OR POOL</th>
					<th className="min-w-[12%] px-4 py-0 font-semibold">KEYS</th>
					<th className="min-w-[27%] px-4 py-0 font-semibold">STATUS</th>
					<th className="min-w-[25%] pl-2 py-0 flex items-center justify-end gap-1 font-semibold">
					</th>
				</tr>
			</thead>
			<tbody className="relative">
				<SentryWalletTableBody
					sentryAddressStatusMap={sentryAddressStatusMap}
					operatorWalletData={operatorWalletData}
					operatorAssignedWallets={getOperatorWallets()}
				/>
			</tbody>
		</table>)
	}

	return (
		<>
			{assignedWallet.show && (
				<WalletConnectedModal
					txHash={assignedWallet.txHash}
					onClose={onCloseWalletConnectedModal}
				/>
			)}

			{unassignedWallet.show && (
				<WalletDisconnectedModal
					txHash={unassignedWallet.txHash}
					onClose={onCloseWalletConnectedModal}
				/>
			)}

			<div className="h-full flex flex-col shadow-default pl-4">
				<div
					className="sticky top-0 flex flex-col items-center  h-auto z-10 h-full">
					<div
						className={`flex flex-row justify-between items-center w-full ${drawerState === null ? "py-[11px]" : "py-[15px]"} bg-nulnOil gap-2 pl-[24px] pr-2`}>
						<div className="flex flex-row items-center gap-2 w-full max-w-[65%] z-[60]">
							<span>
								{sentryRunning && hasAssignedKeys && funded && <GreenPulse size='md' />}
								{sentryRunning && !hasAssignedKeys && !funded && <YellowPulse size='md' />}
								{!sentryRunning && <GreyPulse size='md' />}
							</span>
							<h2 className="text-3xl font-bold text-white mr-[5px]">Sentry Wallet</h2>

							{!sentryRunning ? (
								<p className="text-elementalGrey text-lg font-medium mt-1 mr-[5px]">
									Stopped
								</p>
							) : hasAssignedKeys ? (
								<p className="text-drunkenDragonFly text-lg font-medium mt-1 mr-[5px]">
									Active
								</p>
							) : <p className="text-bananaBoat text-lg font-medium mt-1 mr-[5px]">
								No Keys
							</p>
							}

							<div className="relative w-full max-w-[185px]">
								<BaseCallout extraClasses={{
									calloutWrapper: "h-[50px] !bg-chromaphobicBlack text-white",
									calloutFront: " !bg-dynamicBlack !px-[15px] !justify-start"
								}}>
									<p className="mr-[10px]">
										{operatorLoading ? "Loading..." : `${operatorAddress!.slice(0, 5)}...${operatorAddress!.slice(-3)}`}
									</p>

									<div
										onClick={() => copyPublicKey()}
										className="cursor-pointer mr-[5px]"
									>
										{copied
											? (<AiOutlineCheck className="h-[15px]" />)
											: (<CopyIcon />)
										}
									</div>
								</BaseCallout>
								<div className="absolute top-[14px] right-[35px]">
									<CustomTooltip
										header={"Sentry Wallet is encrypted on your device"}
										content={"This wallet is exportable and EVM compatible."}
										extraClasses={{
											tooltipContainer: "!left-[-38px] !text-americanSilver !top-[49px]",
											tooltipHeader: "!text-americanSilver",
											arrowStyles: "!left-[-16px] !top-[25px]"
										}}
									>
										<HelpIcon />
									</CustomTooltip>
								</div>
								<div
									className="absolute right-[10px] top-[16px] cursor-pointer mx-[5px] text-americanSilver"
									onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
								>
									<HiOutlineDotsVertical />
									{isMoreOptionsOpen && (
										<div
											className="absolute flex flex-col items-center top-8 right-0 w-[210px] bg-nulnOil border border-chromaphobicBlack">
											<div
												onClick={() => setDrawerState(DrawerView.ExportSentry)}
												className="w-full flex justify-center items-center gap-1 py-2 cursor-pointer hover:bg-dynamicBlack duration-300 ease-in-out"
											>
												<BiUpload className="h-[16px]" /> Export Sentry Wallet
											</div>
											<div
												onClick={() => setDrawerState(DrawerView.ImportSentry)}
												className="w-full flex justify-center items-center gap-1 py-2 cursor-pointer hover:bg-dynamicBlack duration-300 ease-in-out"
											>
												<BiDownload className="h-[16px]" /> Import Sentry Wallet
											</div>
										</div>
									)}
								</div>
							</div>

							{sentryRunning ? (
								<button
									onClick={() => {
										setDrawerState(DrawerView.Whitelist)
									}}
									className={`ml-[5px] flex flex-row justify-center items-center gap-2 text-pelati text-lg font-bold ${!stopRuntime ? 'cursor-not-allowed' : "hover:text-white duration-300"}`}
									disabled={!stopRuntime}
								>
									{stopRuntime ?
										<>
											<MdRefresh />
											Restart Sentry
										</>
										:
										<>
											<BiLoaderAlt className="animate-spin" color={"#FF2C3A"} />
											Starting Sentry
										</>
									}

								</button>
							) : (
								<button
									onClick={startRuntime}
									className="ml-4 flex flex-row justify-center items-center gap-2 text-lg font-bold text-pelati hover:text-white duration-300 ease-in-out"
								>
									<FaPlay className="h-[15px]" />
									Start Sentry
								</button>
							)}
						</div>

						{drawerState === null && (
							<ActionsRequiredPromptHandler />
						)}
					</div>

					<SentryWalletHeader
						totalWallets={owners.length + pools.length} //add one for the operator wallet itself
						assignedWallets={getAssignedWalletCount()}
						totalKeys={totalAssignedKeys}
						assignedKeys={getAssignedKeysCount()}
					/>

					<div className="px-5 pt-4 w-full bg-nulnOil pb-[16px]">
						<InfoBanner
							heading="We've revamped how keys are shown on this page"
							description="This page now shows all your connected wallets, and their respective keys in a single view. "
							externalLink="https://xai-foundation.gitbook.io/xai-network"
						/>
					</div>

					<div className="bg-nulnOil w-full py-[8px] pl-[24px] flex items-center">
						<p className="text-elementalGrey">{owners.length + pools.length} connected wallets</p>
						{isBalanceLoading ? (
							<p className="flex items-center text-lg text-pelati select-none ml-[18px]">
								Refreshing
							</p>
						) : (
							<a
								onClick={onRefreshEthBalance}
								className="underline flex items-center text-lg text-pelati gap-1 cursor-pointer select-none ml-[14px] hover:text-white duration-300 ease-in-out"
							>
								<MdRefresh /> Refresh
							</a>
						)}
					</div>
					<div className="flex flex-col max-h-[70vh] w-full h-full bg-nulnOil">
						<div className="w-full h-full">
							{TableComponent()}
						</div>
					</div>
				</div>


				{sentryRunning && owners && owners.length <= 0 && (
					<>
						{loading ? (
							<div className="w-full flex-1 flex flex-col justify-center items-center">
								{/* <h3 className="text-center">Loading...</h3> */}
							</div>
						) : (
							sentryRunning ? (
								<div
									className="w-full flex-1 flex flex-col justify-center items-center bg-nulnOil shadow-default">
									<AssignKeysFromNewWallet />
								</div>
							) : (
								<div className="w-full flex-1 flex flex-col justify-center items-center">
									<AssignKeysSentryNotRunning />
								</div>
							)
						)}
					</>
				)}

				{!sentryRunning && (
					<div
						className="w-full flex-1 flex flex-col justify-center items-center">
						<AssignKeysSentryNotRunning />
					</div>
				)}
			</div>
		</>
	);
}
