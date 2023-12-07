import {AiOutlineCheck, AiOutlineInfoCircle} from "react-icons/ai";
import {ReactNode, useState} from "react";
import {BiDownload, BiLinkExternal, BiLoaderAlt, BiUpload} from "react-icons/bi";
import {useOperator} from "../operator";
import {PiCopy} from "react-icons/pi";
import {HiOutlineDotsVertical} from "react-icons/hi";
import {GiPauseButton} from "react-icons/gi";
import {MdRefresh} from "react-icons/md";
import {useAtom, useAtomValue, useSetAtom} from "jotai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager.js";
import {FaPlay} from "react-icons/fa6";
import {IoIosArrowDown} from "react-icons/io";
import {AssignKeysFromNewWallet} from "@/components/AssignKeysFromNewWallet";
import {WalletConnectedModal} from "@/features/home/modals/WalletConnectedModal";
import {WalletDisconnectedModal} from "@/features/home/modals/WalletDisconnectedModal";
import {useQueryClient} from "react-query";
import {useBalance} from "@/hooks/useBalance";
import {ethers} from "ethers";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {Tooltip} from "../../../../../packages/ui/src/features/tooltip/Tooltip";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {ActionsRequiredPromptHandler} from "@/features/drawer/ActionsRequiredPromptHandler";
import {SentryWalletHeader} from "@/features/home/SentryWalletHeader";
import {chainStateAtom, useChainDataRefresh} from "@/hooks/useChainDataWithCallback";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {AssignKeysSentryNotRunning} from "@/components/AssignKeysSentryNotRunning";

// TODO -> replace with dynamic value later
export const recommendedFundingBalance = ethers.parseEther("0.005");

export function SentryWallet() {
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);
	const {ownersLoading, owners, licensesLoading, licensesList} = useAtomValue(chainStateAtom);

	const queryClient = useQueryClient();
	const {hasAssignedKeys} = useAtomValue(accruingStateAtom);


	const {isLoading: operatorLoading, publicKey: operatorAddress} = useOperator();
	const {data: balance} = useBalance(operatorAddress);

	// TODO connect the refresh button on the x keys in y wallets text and query-ify these so we know when it's been cache cleared
	const loading = operatorLoading || ownersLoading || licensesLoading;
	const keyCount = licensesList.length;

	const [copied, setCopied] = useState<boolean>(false);
	const [assignedWallet, setAssignedWallet] = useState<{ show: boolean, txHash: string }>({show: false, txHash: ""});
	const [unassignedWallet, setUnassignedWallet] = useState<{ show: boolean, txHash: string }>({
		show: false,
		txHash: ""
	});
	const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
	const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState<boolean>(false); // dropdown state
	const {startRuntime, stopRuntime, sentryRunning, nodeLicenseStatusMap} = useOperatorRuntime();


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
					console.error('Unable to copy to clipboard: ', err);
				});
		} else {
			console.error('Clipboard API not available, unable to copy to clipboard');
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
					console.error('Unable to copy to clipboard: ', err);
				});
		} else {
			console.error('Clipboard API not available, unable to copy to clipboard');
		}
	}

	function getDropdownItems() {
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

	function onCloseWalletConnectedModal() {
		setAssignedWallet({show: false, txHash: ""});
		setUnassignedWallet({show: false, txHash: ""});
		setSelectedWallet(null);
		refresh();
		void queryClient.invalidateQueries({queryKey: ["ownersForOperator", operatorAddress]});
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

			<div className="w-full h-full flex flex-col">
				<div
					className="sticky top-0 flex flex-col items-center w-full h-auto bg-white z-10">
					<div
						className="flex flex-row justify-between items-center w-full py-2 gap-2 border-b border-gray-200 pl-10 pr-2">
						<div className="flex flex-row items-center gap-2">
							<h2 className="text-lg font-semibold">Sentry Wallet</h2>

							{sentryRunning && balance?.wei === 0n && (
								<p className="border border-[#D9771F] bg-[#FEFCE8] text-[#D9771F] text-xs font-semibold uppercase rounded-full px-2">
									No ETH
								</p>
							)}

							{sentryRunning && !hasAssignedKeys && (
								<>
									<p className="border border-[#D9771F] bg-[#FEFCE8] text-[#D9771F] text-xs font-semibold uppercase rounded-full px-2">
										No Keys Assigned
									</p>
								</>
							)}

							{!sentryRunning && (
								<p className="border border-[#F5F5F5] bg-[#F5F5F5] text-[#A3A3A3] text-xs font-semibold uppercase rounded-full px-2">
									Stopped
								</p>
							)}

							{sentryRunning && hasAssignedKeys && balance?.wei !== 0n && (
								<p className="border border-[#22C55E] bg-[#F0FDF4] text-[#16A34A] text-xs font-semibold uppercase rounded-full px-2">
									Active
								</p>
							)}

							<div className="flex flex-row items-center gap-2 text-[#A3A3A3] text-[15px]">
								<p>
									{operatorLoading ? "Loading..." : operatorAddress}
								</p>

								<div
									onClick={() => copyPublicKey()}
									className="cursor-pointer"
								>
									{copied
										? (<AiOutlineCheck className="h-[15px]"/>)
										: (<PiCopy className="h-[15px]"/>)
									}
								</div>

								<Tooltip
									header={"Sentry Wallet is encrypted on your device"}
									body={"This wallet is exportable and EVM compatible."}
									width={350}
								>
									<AiOutlineInfoCircle className="text-[#A3A3A3]"/>
								</Tooltip>

								<div
									className="relative cursor-pointer"
									onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
								>
									<HiOutlineDotsVertical/>
									{isMoreOptionsOpen && (
										<div
											className="absolute flex flex-col items-center top-8 right-0 w-[210px] bg-white border border-[#E5E5E5] text-black">
											<div
												onClick={() => setDrawerState(DrawerView.ExportSentry)}
												className="w-full flex justify-center items-center gap-1 py-2 cursor-pointer hover:bg-gray-100"
											>
												<BiUpload className="h-[16px]"/> Export Sentry Wallet
											</div>
											<div
												onClick={() => setDrawerState(DrawerView.ImportSentry)}
												className="w-full flex justify-center items-center gap-1 py-2 cursor-pointer hover:bg-gray-100"
											>
												<BiDownload className="h-[16px]"/> Import Sentry Wallet
											</div>
										</div>
									)}
								</div>
							</div>

							{sentryRunning ? (
								<button
									onClick={stopRuntime}
									className={`ml-4 flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2 ${!stopRuntime && 'cursor-not-allowed'}`}
									disabled={!stopRuntime}
								>
									{stopRuntime ?
										<>
											<GiPauseButton className="h-[15px]"/>
											Pause Sentry
										</>
										:
										<>
											<BiLoaderAlt className="animate-spin" color={"#A3A3A3"}/>
											Starting Sentry
										</>
									}

								</button>
							) : (
								<button
									onClick={startRuntime}
									className="ml-4 flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2"
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

					<div className="flex flex-row items-center w-full py-3 pl-10 gap-1">
						<h2 className="font-semibold">Assigned Keys</h2>
						<p className="text-sm bg-gray-100 px-2 rounded-2xl text-gray-500">
							{owners.length > 0 ? (
								loading ? "Loading..." : `${keyCount} key${keyCount === 1 ? "" : "s"} in ${owners.length} wallet${owners.length === 1 ? "" : "s"}`
							) : (
								"Keys not assigned"
							)}
						</p>
						{loading ? (
							<span className="flex items-center text-[15px] text-[#A3A3A3] select-none">
								Refreshing
							</span>
						) : (
							<a
								onClick={onRefreshTable}
								className="flex items-center text-[15px] text-[#F30919] gap-1 cursor-pointer select-none"
							>
								<MdRefresh/> Refresh
							</a>
						)}
						<Tooltip
							header={"Purchased keys must be assigned to Sentry Wallet"}
							body={"To assign keys, connect all wallets containing Sentry Keys."}
							body2={"The wallet containing the purchased keys will perform a gas transaction to assign the keys to the Sentry."}
						>
							<AiOutlineInfoCircle className="text-[#A3A3A3]"/>
						</Tooltip>
					</div>
				</div>

				{/*		Keys	*/}
				{sentryRunning && owners && owners.length > 0 && (
					<>
						<div>
							<div className="w-full h-auto flex flex-col py-3 pl-10">
								<p className="text-sm uppercase text-[#A3A3A3] mb-2">
									View Wallet
								</p>
								<div className="flex flex-row gap-2">
									<div>
										<div
											onClick={() => setIsOpen(!isOpen)}
											className={`flex items-center justify-between w-[538px] border-[#A3A3A3] border-r border-l border-t ${!isOpen ? "border-b" : null} border-[#A3A3A3] p-2`}
										>
											<p>{selectedWallet || `All assigned wallets (${owners.length})`}</p>
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
										className="flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2"
									>
										Assign keys from new wallet
										<BiLinkExternal className="h-[15px]"/>
									</button>

									<button
										disabled={selectedWallet === null}
										onClick={() => {
											setModalState(ModalView.TransactionInProgress)
											window.electron.openExternal(`https://sentry.xai.games/#/unassign-wallet/${operatorAddress}`)
										}}
										className={`flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] ${selectedWallet === null ? 'text-[#D4D4D4] cursor-not-allowed' : ""} px-4 py-2`}
									>
										Un-assign this wallet
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
								<div className="w-full flex-1 flex flex-col justify-center items-center">
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
					<div className="w-full flex-1 flex flex-col justify-center items-center">
						<AssignKeysSentryNotRunning/>
					</div>
				)}
			</div>
		</>
	);
}
