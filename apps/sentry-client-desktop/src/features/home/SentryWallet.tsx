import {AiOutlineCheck, AiOutlineInfoCircle} from "react-icons/ai";
import {ReactNode, useState} from "react";
import {BiDownload, BiLinkExternal, BiLoaderAlt, BiUpload} from "react-icons/bi";
import {useOperator} from "../operator";
import {PiCopy} from "react-icons/pi";
import {HiOutlineDotsVertical} from "react-icons/hi";
import {MdRefresh} from "react-icons/md";
import {useAtom, useAtomValue, useSetAtom} from "jotai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager.js";
import {FaPlay} from "react-icons/fa6";
import {IoIosArrowDown} from "react-icons/io";
import {AssignKeysFromNewWallet} from "@/components/AssignKeysFromNewWallet";
import {WalletConnectedModal} from "@/features/home/modals/WalletConnectedModal";
import {WalletDisconnectedModal} from "@/features/home/modals/WalletDisconnectedModal";
import {useQueryClient} from "react-query";
import {ethers} from "ethers";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {CustomTooltip, Tooltip} from "@sentry/ui";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {ActionsRequiredPromptHandler} from "@/features/drawer/ActionsRequiredPromptHandler";
import {SentryWalletHeader} from "@/features/home/SentryWalletHeader";
import {chainStateAtom, useChainDataRefresh} from "@/hooks/useChainDataWithCallback";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {AssignKeysSentryNotRunning} from "@/components/AssignKeysSentryNotRunning";
import {LuListChecks} from "react-icons/lu";
import {useStorage} from "@/features/storage";
import log from "electron-log";
import {GreenPulse, GreyPulse, YellowPulse} from "@/features/keys/StatusPulse";
import BaseCallout from "@sentry/ui/dist/src/rebrand/callout/BaseCallout";
import {CopyIcon, HelpIcon} from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";

// TODO -> replace with dynamic value later
export const recommendedFundingBalance = ethers.parseEther("0.005");

export function SentryWallet() {
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);
	const {ownersLoading, owners, licensesLoading, licensesList} = useAtomValue(chainStateAtom);
	const queryClient = useQueryClient();
	const {hasAssignedKeys, funded} = useAtomValue(accruingStateAtom);

	const {isLoading: operatorLoading, publicKey: operatorAddress} = useOperator();
	// const {data: balance} = useBalance(operatorAddress);

	const loading = operatorLoading || ownersLoading || licensesLoading;

	const [copied, setCopied] = useState<boolean>(false);
	const [assignedWallet, setAssignedWallet] = useState<{ show: boolean, txHash: string }>({show: false, txHash: ""});
	const [unassignedWallet, setUnassignedWallet] = useState<{ show: boolean, txHash: string }>({
		show: false,
		txHash: ""
	});
	const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
	const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState<boolean>(false); // dropdown state
	const {startRuntime, stopRuntime, sentryRunning, nodeLicenseStatusMap} = useOperatorRuntime();
	const {data} = useStorage();

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const {refresh} = useChainDataRefresh();

	// assign wallet
	(window as any).deeplinks?.assignedWallet((_event, txHash) => {
		setModalState(null)
		setAssignedWallet({show: true, txHash});
	});

	// un-assign wallet
	(window as any).deeplinks?.unassignedWallet((_event, txHash) => {
		setModalState(null)
		setSelectedWallet(null);
		setUnassignedWallet({show: true, txHash});
	});

	function onRefreshTable() {
		queryClient.invalidateQueries({queryKey: ["ownersForOperator", operatorAddress]});
		refresh();
	}

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

	function copySelectedWallet() {
		if (selectedWallet && navigator.clipboard) {
			navigator.clipboard.writeText(selectedWallet)
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

	function getDropdownItems() {
		// If the user has whitelisted wallets, update the dropdown to populate with their whitelistedWallets.
		if (data?.whitelistedWallets) {
			return data?.whitelistedWallets.map((wallet, i) => (
				<p
					onClick={() => {
						setSelectedWallet(wallet);
						setIsOpen(false);
					}}
					className="p-2 cursor-pointer hover:bg-gray-100"
					key={`sentry-item-${i}`}
				>
					{wallet}
				</p>
			));
		} else {
			return owners.map((wallet, i) => (
				<p
					onClick={() => {
						setSelectedWallet(wallet);
						setIsOpen(false);
					}}
					className="p-2 cursor-pointer hover:bg-gray-100"
					key={`sentry-item-${i}`}
				>
					{wallet}
				</p>
			));
		}
	}

	function getKeys() {
		if (nodeLicenseStatusMap.size === 0) {
			return (
				<tr className="bg-white flex px-8 text-sm">
					<td colSpan={3} className="w-full text-center">No keys found.</td>
				</tr>
			);
		}

		let i = 0;
		const element: Array<ReactNode> = [];

		new Map([...nodeLicenseStatusMap].filter(([, status]) => {
			if (selectedWallet === null) {
				return true;
			}
			return status.ownerPublicKey === selectedWallet;
		}))
			.forEach((status, key) => {
				const isEven = i++ % 2 === 0;

				element.push(
					<tr className={`${isEven ? "bg-[#FAFAFA]" : "bg-white"} flex px-8 text-sm`} key={`license-${i}`}>
						<td className="w-full max-w-[70px] px-4 py-2">{key.toString()}</td>
						<td className="w-full max-w-[400px] px-4 py-2">{status.ownerPublicKey}</td>
						<td className="w-full max-w-[400px] px-4 py-2 text-[#A3A3A3]">
							{status.status}
						</td>
					</tr>
				);
			})
		return element;
	}

	function getWalletCounter() {
		/**
		 * By default, use the assignedWallets values.
		 * If the user has whitelisted wallets, update the counter to populate with their whitelistedWallets values.
		 */
		const keysCounter = data?.whitelistedWallets
			? `${nodeLicenseStatusMap.size} key${nodeLicenseStatusMap.size === 1 ? '' : 's'} in ${data?.whitelistedWallets?.length} wallet${data?.whitelistedWallets?.length === 1 ? '' : 's'}`
			: `${licensesList.length} key${licensesList.length === 1 ? '' : 's'} in ${owners.length} wallet${owners.length === 1 ? '' : 's'}`
		
		return (
			<>
				{nodeLicenseStatusMap.size > 0
					? (loading ? ("Loading...") : (`${keysCounter}`))
					: ("No keys")}
			</>
		);
	}

	function onCloseWalletConnectedModal() {
		setAssignedWallet({show: false, txHash: ""});
		setUnassignedWallet({show: false, txHash: ""});
		setSelectedWallet(null);
		refresh();
		void queryClient.invalidateQueries({queryKey: ["ownersForOperator", operatorAddress]});
	}

	console.log('funded', funded)
	console.log('hasAssignedKeys', hasAssignedKeys)

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

			<div className="w-full h-full flex flex-col">
				<div
					className="sticky top-0 flex flex-col items-center w-full h-auto z-10">
					<div
						className="flex flex-row justify-between items-center w-full py-[22px] bg-primaryBgColor/75 shadow-default gap-2 border-b border-primaryBorderColor pl-[24px] pr-2 z-50">
						<div className="flex flex-row items-center gap-2 w-full max-w-[50%]">
							<span>
								{sentryRunning && hasAssignedKeys && funded && <GreenPulse size='md'/>}
								{sentryRunning && !hasAssignedKeys && !funded && <YellowPulse size='md'/>}
								{!sentryRunning && <GreyPulse size='md'/>}
							</span>
							<h2 className="text-3xl font-bold text-white mr-[5px]">Sentry Wallet</h2>

							{!sentryRunning ? (
								<p className="text-secondaryText text-lg font-medium mt-1 mr-[5px]">
									Stopped
								</p>
							) : hasAssignedKeys ? (
								<p className="text-successText text-lg font-medium mt-1 mr-[5px]">
									Active
								</p>
							) : <p className="text-primaryWarningText text-lg font-medium mt-1 mr-[5px]">
								No Keys
							</p>
							}

							{/*{sentryRunning && balance?.wei === 0n && (*/}
							{/*	<p className="border border-[#D9771F] bg-[#FEFCE8] text-[#D9771F] text-xs font-semibold uppercase rounded-full px-2">*/}
							{/*		No AETH*/}
							{/*	</p>*/}
							{/*)}*/}

							{/*{sentryRunning && !hasAssignedKeys && (*/}
							{/*	<>*/}
							{/*		<p className="border border-[#D9771F] bg-[#FEFCE8] text-[#D9771F] text-xs font-semibold uppercase rounded-full px-2">*/}
							{/*			No Keys Assigned*/}
							{/*		</p>*/}
							{/*	</>*/}
							{/*)}*/}

							<div className="relative w-full max-w-[185px]">
								<BaseCallout extraClasses={{
									calloutWrapper: "h-[50px] !bg-primaryBorderColor text-white",
									calloutFront: " !bg-secondaryBgColor !px-[15px] !justify-start"
								}}>
									<p className="mr-[10px]">
										{operatorLoading ? "Loading..." : `${operatorAddress!.slice(0, 5)}...${operatorAddress!.slice(-3)}`}
									</p>

									<div
										onClick={() => copyPublicKey()}
										className="cursor-pointer mr-[5px]"
									>
										{copied
											? (<AiOutlineCheck className="h-[15px]"/>)
											: (<CopyIcon />)
										}
									</div>
								</BaseCallout>
								<div className="absolute top-[14px] right-[35px]">
									<CustomTooltip
										header={"Sentry Wallet is encrypted on your device"}
										content={"This wallet is exportable and EVM compatible."}
										extraClasses={{tooltipContainer: "!left-[-38px] !text-primaryText !top-[49px]", tooltipHeader: "!text-primaryText", arrowStyles: "!left-[-16px] !top-[25px]"}}
									>
										<HelpIcon />
									</CustomTooltip>
								</div>
								<div
									className="absolute right-[10px] top-[16px] cursor-pointer mx-[5px] text-primaryText"
									onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
								>
									<HiOutlineDotsVertical/>
									{isMoreOptionsOpen && (
										<div
											className="absolute flex flex-col items-center top-8 right-0 w-[210px] bg-primaryBgColor border border-primaryBorderColor">
											<div
												onClick={() => setDrawerState(DrawerView.ExportSentry)}
												className="w-full flex justify-center items-center gap-1 py-2 cursor-pointer hover:bg-secondaryBgColor duration-300 ease-in-out"
											>
												<BiUpload className="h-[16px]"/> Export Sentry Wallet
											</div>
											<div
												onClick={() => setDrawerState(DrawerView.ImportSentry)}
												className="w-full flex justify-center items-center gap-1 py-2 cursor-pointer hover:bg-secondaryBgColor duration-300 ease-in-out"
											>
												<BiDownload className="h-[16px]"/> Import Sentry Wallet
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
									className={`ml-[10px] flex flex-row justify-center items-center gap-2 text-tertiaryText text-lg font-bold ${!stopRuntime && 'cursor-not-allowed'}`}
									disabled={!stopRuntime}
								>
									{stopRuntime ?
										<>
											<MdRefresh/>
											Restart Sentry
										</>
										:
										<>
											<BiLoaderAlt className="animate-spin" color={"#FF2C3A"}/>
											Starting Sentry
										</>
									}

								</button>
							) : (
								<button
									onClick={startRuntime}
									className="ml-4 flex flex-row justify-center items-center gap-2 text-lg font-bold text-tertiaryText"
								>
									<FaPlay className="h-[15px]"/>
									Start Sentry
								</button>
							)}
						</div>

						{drawerState === null && (
							<ActionsRequiredPromptHandler/>
						)}
					</div>

					<SentryWalletHeader/>

					<div
						className="flex flex-row items-center w-full py-[22px] pl-[24px] gap-[20px] bg-primaryBgColor/75 shadow-default">
						<h2 className="font-bold text-white text-2xl uppercase">Assigned Keys</h2>
						<div className="flex gap-[5px] items-center">
							<p className="text-secondaryText text-lg font-medium">
								{getWalletCounter()}

								{/*{owners.length > 0 ? (*/}
								{/*	loading ? "Loading..." : `${keyCount} key${keyCount === 1 ? "" : "s"} in ${owners.length} wallet${owners.length === 1 ? "" : "s"}`*/}
								{/*) : (*/}
								{/*	"Keys not assigned"*/}
								{/*)}*/}
							</p>
							<CustomTooltip
								header={"Purchased keys must be assigned to Sentry Wallet"}
								extraClasses={{tooltipContainer: "!left-[-38px]", tooltipHeader: "!text-secondaryText"}}
								content={<div className="text-secondaryText">
									<span className="block my-[10px]">To assign keys, connect all wallets containing Sentry Keys.</span>
									<span className="block">The wallet containing the purchased keys will perform a gas transaction to assign the keys to the Sentry.</span>
								</div>}
							>
								<HelpIcon width={14} height={14}/>
							</CustomTooltip>
						</div>
						{loading ? (
							<span className="flex items-center text-lg font-bold text-tertiaryText select-none">
								Refreshing
							</span>
						) : (
							<a
								onClick={onRefreshTable}
								className="flex items-center text-lg text-tertiaryText gap-1 cursor-pointer select-none"
							>
								<MdRefresh/> Refresh
							</a>
						)}

					</div>
				</div>

				{/*		Keys	*/}
				{sentryRunning && owners && owners.length > 0 && (
					<>
						<div>
							<div className="w-full h-auto flex flex-col py-3 pl-10">
								<p className="text-sm uppercase text-[#A3A3A3] mb-2">
									View Wallet/Pools
								</p>
								<div className="flex flex-row gap-2">
									<div>
										<div
											onClick={() => setIsOpen(!isOpen)}
											className={`flex items-center justify-between w-[538px] border-[#A3A3A3] border-r border-l border-t ${!isOpen ? "border-b" : "pb-[9px]"} border-[#A3A3A3] p-2`}
										>
											<p>{selectedWallet || `All assigned wallets/pools (${data?.whitelistedWallets ? data.whitelistedWallets.length : owners.length})`}</p>
											<IoIosArrowDown
												className={`h-[15px] transform ${isOpen ? "rotate-180 transition-transform ease-in-out duration-300" : "transition-transform ease-in-out duration-300"}`}
											/>
										</div>

										{isOpen && (
											<div
												className="absolute flex flex-col w-[538px] border-r border-l border-b border-[#A3A3A3] bg-white z-10">
												<p
													onClick={() => {
														setSelectedWallet(null);
														setIsOpen(false);
													}}
													className="p-2 cursor-pointer hover:bg-gray-100"
												>
													All
												</p>
												{getDropdownItems()}
											</div>
										)}
									</div>

									<button
										disabled={selectedWallet === null}
										onClick={() => copySelectedWallet()}
										className={`flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] ${selectedWallet === null ? 'text-[#D4D4D4] cursor-not-allowed' : ""} px-4 py-2`}
									>

										{copied
											? (<AiOutlineCheck className="h-[15px]"/>)
											: (<PiCopy className="h-[15px]"/>)
										}
										Copy address
									</button>

									<button
										onClick={() => {
											setModalState(ModalView.TransactionInProgress)
											window.electron.openExternal(`https://sentry.xai.games/#/assign-wallet/${operatorAddress}`)
										}}
										className={`flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2`}
									>
										Assign wallet
										<BiLinkExternal className="h-[15px]"/>
									</button>

									<button
										onClick={() => setDrawerState(DrawerView.Whitelist)}
										className={`flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2`}
									>
										<LuListChecks className="h-[15px]"/>
										Allowed wallets/pools
									</button>

									<button
										disabled={selectedWallet === null}
										onClick={() => {
											setModalState(ModalView.TransactionInProgress)
											window.electron.openExternal(`https://sentry.xai.games/#/unassign-wallet/${operatorAddress}`)
										}}
										className={`flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] ${selectedWallet === null ? 'text-[#D4D4D4] cursor-not-allowed' : ""} px-4 py-2`}
									>
										Un-assign wallet
										<BiLinkExternal className="h-[15px]"/>
									</button>
								</div>
							</div>

							<div className="flex flex-col max-h-[70vh]">
								<div className="w-full overflow-y-auto">
									<table className="w-full bg-white">
										<thead className="text-[#A3A3A3] sticky top-0 bg-white">
										<tr className="flex text-left text-[12px] uppercase px-8">
											<th className="w-full max-w-[70px] px-4 py-2">Key Id</th>
											<th className="w-full max-w-[400px] px-4 py-2">Owner Address</th>
											<th className="w-full max-w-[400px] px-4 py-2">Claim Status</th>
										</tr>
										</thead>
										<tbody>
										{loading ? (
											<tr className="text-[#A3A3A3] text-sm flex px-8">
												<td colSpan={3} className="w-full text-center">Loading...</td>
											</tr>
										) : getKeys()}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</>
				)}

				{sentryRunning && owners && owners.length <= 0 && (
					<>
						{loading ? (
							<div className="w-full flex-1 flex flex-col justify-center items-center">
								<h3 className="text-center">Loading...</h3>
							</div>
						) : (
							sentryRunning ? (
								<div
									className="w-full flex-1 flex flex-col justify-center items-center bg-primaryBgColor/75 shadow-default">
									<AssignKeysFromNewWallet/>
								</div>
							) : (
								<div className="w-full flex-1 flex flex-col justify-center items-center">
									<AssignKeysSentryNotRunning/>
								</div>
							)
						)}
					</>
				)}

				{!sentryRunning && (
					<div
						className="w-full flex-1 flex flex-col justify-center items-center">
						<AssignKeysSentryNotRunning/>
					</div>
				)}
			</div>
		</>
	);
}
