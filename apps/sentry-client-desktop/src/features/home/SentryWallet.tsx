import {AiOutlineCheck} from "react-icons/ai";
import {ReactNode, useState} from "react";
import {BiDownload, BiLoaderAlt, BiUpload} from "react-icons/bi";
import {useOperator} from "../operator";
import {HiOutlineDotsVertical} from "react-icons/hi";
import {MdRefresh} from "react-icons/md";
import {useAtom, useAtomValue, useSetAtom} from "jotai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager.js";
import {FaPlay} from "react-icons/fa6";
import {AssignKeysFromNewWallet} from "@/components/AssignKeysFromNewWallet";
import {WalletConnectedModal} from "@/features/home/modals/WalletConnectedModal";
import {WalletDisconnectedModal} from "@/features/home/modals/WalletDisconnectedModal";
import {useQueryClient} from "react-query";
import {ethers} from "ethers";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {CustomTooltip, Dropdown, DropdownItem, PrimaryButton} from "@sentry/ui";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {ActionsRequiredPromptHandler} from "@/features/drawer/ActionsRequiredPromptHandler";
import {SentryWalletHeader} from "@/features/home/SentryWalletHeader";
import {chainStateAtom, useChainDataRefresh} from "@/hooks/useChainDataWithCallback";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {AssignKeysSentryNotRunning} from "@/components/AssignKeysSentryNotRunning";
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
				<DropdownItem
					dropdownOptionsCount={data.whitelistedWallets!.length}
					onClick={() => {
						setSelectedWallet(wallet.toLowerCase());
						setIsOpen(false);
					}}
					key={`sentry-item-${i}`}
				>
					{wallet.toLowerCase()}
				</DropdownItem>
			));
		} else {
			return owners.map((wallet, i) => (
				<p
					onClick={() => {
						setSelectedWallet(wallet.toLowerCase());
						setIsOpen(false);
					}}
					className="py-2 px-[15px] cursor-pointer hover:bg-abaddonBlack"
					key={`sentry-item-${i}`}
				>
					{wallet.toLowerCase()}
				</p>
			));
		}
	}

	function getKeys() {
		if (nodeLicenseStatusMap.size === 0) {
			return (
				<tr className="flex pr-8 py-[15px] bg-nulnOil text-sm">
					<td colSpan={3} className="w-full text-center text-lg text-medium text-americanSilver">No keys found.</td>
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
				//const isEven = i++ % 2 === 0;

				element.push(
					<tr className={`bg-nulnOil flex pl-[25px] pr-8 text-sm border-b border-chromaphobicBlack`} key={`license-${i}`}>
						<td className="w-full max-w-[65px] pr-4 py-4 text-lg font-medium text-elementalGrey">{key.toString()}</td>
						<td className="w-full max-w-[400px] pr-4 py-4 text-lg font-medium text-elementalGrey">{status.ownerPublicKey}</td>
						<td className="w-full max-w-[400px] px-4 py-4 text-lg font-medium text-elementalGrey">
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

			<div className="h-full flex flex-col shadow-default pl-4">
				<div
					className="sticky top-0 flex flex-col items-center  h-auto z-10">
					<div
						className={`flex flex-row justify-between items-center w-full ${drawerState === null ? "py-[11px]" : "py-[15px]"} bg-nulnOil gap-2 border-b border-chromaphobicBlack pl-[24px] pr-2`}>
						<div className="flex flex-row items-center gap-2 w-full max-w-[65%] z-[60]">
							<span>
								{sentryRunning && hasAssignedKeys && funded && <GreenPulse size='md'/>}
								{sentryRunning && !hasAssignedKeys && !funded && <YellowPulse size='md'/>}
								{!sentryRunning && <GreyPulse size='md'/>}
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
											? (<AiOutlineCheck className="h-[15px]"/>)
											: (<CopyIcon/>)
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
										<HelpIcon/>
									</CustomTooltip>
								</div>
								<div
									className="absolute right-[10px] top-[16px] cursor-pointer mx-[5px] text-americanSilver"
									onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
								>
									<HiOutlineDotsVertical/>
									{isMoreOptionsOpen && (
										<div
											className="absolute flex flex-col items-center top-8 right-0 w-[210px] bg-nulnOil border border-chromaphobicBlack">
											<div
												onClick={() => setDrawerState(DrawerView.ExportSentry)}
												className="w-full flex justify-center items-center gap-1 py-2 cursor-pointer hover:bg-dynamicBlack duration-300 ease-in-out"
											>
												<BiUpload className="h-[16px]"/> Export Sentry Wallet
											</div>
											<div
												onClick={() => setDrawerState(DrawerView.ImportSentry)}
												className="w-full flex justify-center items-center gap-1 py-2 cursor-pointer hover:bg-dynamicBlack duration-300 ease-in-out"
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
									className={`ml-[5px] flex flex-row justify-center items-center gap-2 text-pelati text-lg font-bold ${!stopRuntime ? 'cursor-not-allowed' : "hover:text-white duration-300"}`}
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
									className="ml-4 flex flex-row justify-center items-center gap-2 text-lg font-bold text-pelati hover:text-white duration-300 ease-in-out"
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
						className=" w-full py-[22px] pl-[24px]  bg-nulnOil">
						<div className="flex flex-row items-center gap-[20px]">
							<h2 className="font-bold text-white text-2xl uppercase">Assigned Keys</h2>
							<div className="flex gap-[5px] items-center">
								<p className="text-elementalGrey text-lg font-medium">
									{getWalletCounter()}

									{/*{owners.length > 0 ? (*/}
									{/*	loading ? "Loading..." : `${keyCount} key${keyCount === 1 ? "" : "s"} in ${owners.length} wallet${owners.length === 1 ? "" : "s"}`*/}
									{/*) : (*/}
									{/*	"Keys not assigned"*/}
									{/*)}*/}
								</p>
								<CustomTooltip
									header={"Purchased keys must be assigned to Sentry Wallet"}
									extraClasses={{
										tooltipContainer: "!left-[-38px]",
										tooltipHeader: "!text-elementalGrey"
									}}
									content={<div className="text-elementalGrey">
										<span className="block my-[10px]">To assign keys, connect all wallets containing Sentry Keys.</span>
										<span className="block">The wallet containing the purchased keys will perform a gas transaction to assign the keys to the Sentry.</span>
									</div>}
								>
									<HelpIcon width={14} height={14}/>
								</CustomTooltip>
							</div>
							{loading ? (
								<span className="flex items-center text-lg font-bold text-pelati select-none">
								Refreshing
							</span>
							) : (
								<a
									onClick={onRefreshTable}
									className="flex items-center text-lg text-pelati gap-1 cursor-pointer select-none hover:text-white duration-300 ease-in-out font-bold"
								>
									<MdRefresh/> Refresh
								</a>
							)}
						</div>

						{/*		Keys	*/}
						{sentryRunning && owners && owners.length > 0 && (
							<>
								<div className="w-full">
									<div className="w-full h-auto flex flex-col pb-3 mt-[15px] pr-[10px]">
										<div className="flex flex-row gap-2 h-[44px]">
											{data?.whitelistedWallets && data?.whitelistedWallets?.length > 0 &&
												<Dropdown
													setIsOpen={setIsOpen}
													isOpen={isOpen}
													defaultValue={"All"}
													selectedValue={
														selectedWallet
													}
													selectedValueRender={
														<p>{selectedWallet ? `${selectedWallet!.slice(0, 6)}...${selectedWallet!.slice(-6)}` : `All assigned wallets/pools (${data?.whitelistedWallets ? data.whitelistedWallets.length : owners.length})`}</p>
													}
													setSelectedValue={setSelectedWallet}
													getDropdownItems={getDropdownItems}
													extraClasses={{dropdown: "!w-[330px] !h-[44px]"}}
													dropdownOptionsCount={data.whitelistedWallets.length}
												/>
											}

											<PrimaryButton
												isDisabled={selectedWallet === null}
												onClick={() => copySelectedWallet()}
												btnText={"Copy address"}
												wrapperClassName={`!h-[48px] max-w-[146px] mt-[-2px]`}
												colorStyle={"outline"}
												className={`w-[144px] ${selectedWallet === null ? "!h-[48px]" : "!h-[46px]"} text-lg font-bold uppercase !p-0`}

											/>

											<PrimaryButton
												onClick={() => {
													setModalState(ModalView.TransactionInProgress)
													window.electron.openExternal(`https://sentry.xai.games/#/assign-wallet/${operatorAddress}`)
												}}
												wrapperClassName={`max-w-[161px] mt-[-2px]`}
												className={`w-[159px] !h-[48px] text-lg font-bold uppercase !p-0`}
												btnText={"Assign wallet"}
											/>

											<PrimaryButton
												onClick={() => setDrawerState(DrawerView.Whitelist)}
												wrapperClassName={`!h-[48px] max-w-[179px] mt-[-2px]`}
												className={`w-[177px] !h-[46px]  text-lg font-bold uppercase !p-0`}
												colorStyle={"outline"}
												btnText={"Allowed wallets"}
											/>

											<PrimaryButton
												isDisabled={selectedWallet === null}
												onClick={() => {
													setModalState(ModalView.TransactionInProgress)
													window.electron.openExternal(`https://sentry.xai.games/#/unassign-wallet/${operatorAddress}`)
												}}
												wrapperClassName={`!h-[48px] max-w-[123px] mt-[-2px]`}
												colorStyle={"outline"}
												className={`w-[121px] ${selectedWallet === null ? "!h-[48px]" : "!h-[46px]"} text-lg font-bold uppercase !p-0`}
												btnText={"Unassign"}
											/>

										</div>
									</div>


								</div>
							</>
						)}


					</div>
					<div className="flex flex-col max-h-[70vh] w-full">
						<div className="w-full overflow-y-auto ">
							<table className="w-full">
								<thead className="text-[#A3A3A3] sticky top-0 bg-white">
								<tr className="flex text-left text-base font-semibold text-elementalGrey uppercase px-[25px] py-[15px] bg-dynamicBlack">
									<th className="w-full max-w-[50px] !text-nowrap">Key Id</th>
									<th className="w-full max-w-[400px] px-4">Owner Address</th>
									<th className="w-full max-w-[400px] px-[31px]">Claim Status</th>
								</tr>
								</thead>
								<tbody>
								{loading ? (
									<tr className="text-[#A3A3A3] text-sm flex px-8 bg-nulnOil py-4">
										<td colSpan={3}
											className="w-full text-center text-lg font-medium text-elementalGrey">Loading...
										</td>
									</tr>
								) : getKeys()}
								</tbody>
							</table>
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
