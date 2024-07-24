import {AiFillCheckCircle, AiOutlineCheck, AiOutlineMinus, AiOutlinePlus} from "react-icons/ai";
import {useState} from "react";
import {BlockPassKYC} from "@/components/blockpass/Blockpass";
import {getLicensesList, LicenseList, LicenseMap} from "@/hooks/useListNodeLicensesWithCallback";
import {config} from "@sentry/core";
import {StatusMap} from "@/hooks/useKycStatusesWithCallback";
import {CustomTooltip, Dropdown, DropdownItem, PrimaryButton} from "@sentry/ui";
import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useAtomValue, useSetAtom} from "jotai";
import {RemoveWalletModal} from "@/features/home/modals/RemoveWalletModal";
import {WalletAssignedMap} from "@/features/keys/Keys";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {useOperator} from "@/features/operator";
import {useStorage} from "@/features/storage";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {ethers} from "ethers";
import {BiLoaderAlt} from "react-icons/bi";
import {useGetWalletBalance} from "@/hooks/useGetWalletBalance";
import {useGetSingleWalletBalance} from "@/hooks/useGetSingleWalletBalance";
import log from "electron-log";
import { HelpIcon, WarningIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { PiCopy } from "react-icons/pi";

interface HasKeysProps {
	combinedOwners: string[],
	combinedLicensesMap: LicenseMap,
	statusMap: StatusMap,
	isWalletAssignedMap: WalletAssignedMap,
}

export function HasKeys({combinedOwners, combinedLicensesMap, statusMap, isWalletAssignedMap}: HasKeysProps) {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);
	const {data, setData} = useStorage();
	const {balances, isBalancesLoading, balancesFetchedLast} = useAtomValue(accruingStateAtom);

	const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
	const [copiedSelectedWallet, setCopiedSelectedWallet] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isRemoveWalletOpen, setIsRemoveWalletOpen] = useState<boolean>(false);
	const {isLoading: isOperatorLoading, publicKey: operatorAddress} = useOperator();
	const {startRuntime, sentryRunning} = useOperatorRuntime();
	const {data: earnedEsxaiBalance} = useGetWalletBalance(combinedOwners);
	const {data: singleWalletBalance} = useGetSingleWalletBalance(selectedWallet);
	const [mouseOverTooltip, setMouseOverTooltip] = useState(false);

	function startAssignment() {
		if (!isOperatorLoading) {
			setModalState(ModalView.TransactionInProgress);
			window.electron.openExternal(`https://sentry.xai.games/#/assign-wallet/${operatorAddress}`);
		}
	}

	function onStartKyc(wallet) {
		const kycStartedWallets = data?.kycStartedWallets || [];
		if (kycStartedWallets.indexOf(wallet) < 0) {
			kycStartedWallets.push(wallet);
		}

		setData({
			...data,
			kycStartedWallets,
		});
	}

	function renderKeys() {
		let licenses: LicenseList = [];
		if (!selectedWallet) {
			licenses = getLicensesList(combinedLicensesMap);
		} else {
			if (combinedLicensesMap[selectedWallet]) {
				licenses = combinedLicensesMap[selectedWallet].map((license) => {
					return {owner: selectedWallet, key: license};
				});
			}
		}

		if (licenses.length === 0) {
			return (
				<tr className="bg-nulnOil flex px-8 text-lg text-elementalGrey">
					<td colSpan={5} className="w-full text-center">
						No keys found.
					</td>
				</tr>
			);
		}

		return licenses.sort((a, b) => Number(a.key) - Number(b.key)).map((keyWithOwner, i) => {
			const keyString = keyWithOwner.key.toString();
			const owner = keyWithOwner.owner.toString();
			const status = statusMap[owner];
			const isAssigned = isWalletAssignedMap[owner];
			const kycStarted = (data?.kycStartedWallets || []).indexOf(owner) > -1;

			let _status: "sentryNotRunning" | "walletNotAssigned" | "kycStart" | "kycContinue" | "claiming" = "sentryNotRunning";

			if (sentryRunning && !isAssigned) {
				_status = "walletNotAssigned";
			} else if (sentryRunning && isAssigned && !status && !kycStarted) {
				_status = "kycStart";
			} else if (sentryRunning && isAssigned && !status && kycStarted) {
				_status = "kycContinue";
			} else if (sentryRunning && isAssigned && status) {
				_status = "claiming";
			}

			return (
				<tr className={`bg-nulnOil flex pl-6  text-lg border-b border-chromaphobicBlack`} key={`license-${i}`}>
					<td className="min-w-[7%] pr-2 py-2 text-elementalGrey">{keyString}</td>
					<td className="min-w-[39%] px-2 py-2 text-elementalGrey">{owner}</td>
					<td className="min-w-[27%] px-4 py-2 text-elementalGrey">

						{_status === "sentryNotRunning" && (
							<div className="relative flex items-center gap-[5px] font-bold text-bananaBoat">
								<WarningIcon width={18} height={16}/>
								Sentry not running
								<a
									onClick={startRuntime}
									className="text-[#F30919] cursor-pointer hover:text-white duration-200 ease-in"
								>
									Start
								</a>
							</div>
						)}

						{_status === "walletNotAssigned" && (
							<div className="relative flex items-center gap-[7px] font-bold text-bananaBoat">
								<WarningIcon width={18} height={16}/>
								Wallet not assigned
								<a
									onClick={() => startAssignment()}
									className="text-[#F30919] cursor-pointer hover:text-white duration-200 ease-in"
								>
									Assign
								</a>
							</div>
						)}

						{_status === "kycStart" && (
							<div className="relative flex items-center gap-[7px] font-bold text-bananaBoat">
								<WarningIcon width={18} height={16}/>
								KYC required
								<BlockPassKYC
									onClick={() => {
										setDrawerState(DrawerView.ActionsRequiredNotAccruing)
										onStartKyc(owner)
									}}
								/>
							</div>
						)}

						{_status === "kycContinue" && (
							<div className="relative flex items-center gap-[7px] font-bold text-bananaBoat">
								<WarningIcon width={18} height={16}/>
								KYC required
								<BlockPassKYC
									onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
								>
									Continue
								</BlockPassKYC>
							</div>
						)}

						{_status === "claiming" && (
							<div className="relative flex items-center gap-[5px] text-[15px] font-bold text-drunkenDragonFly">
								<AiFillCheckCircle className="w-[18px] h-[16px] text-drunkenDragonFly"/> Claiming rewards when available
							</div>
						)}

					</td>
					<td className="min-w-[15%] pl-4 pr-2  py-2 text-right text-elementalGrey">
						{balances && balances[keyString]
							? ethers.formatEther(balances[keyString].totalAccruedEsXai)
							: "Loading..."}
					</td>
					<td className="min-w-[12%] pl-4 pr-2 py-2 text-hornetSting font-bold text-right">
						<span
							className="cursor-pointer pr-[3px] uppercase hover:text-white duration-300 ease-in-out"
							onClick={() => window.electron.openExternal(`https://opensea.io/assets/arbitrum/${config.nodeLicenseAddress}/${keyString}`)}
						>
							View
						</span>
					</td>
				</tr>
			);
		});
	}

	function getDropdownItems() {
		return Object.values(combinedOwners).map((wallet, i) => (
			<DropdownItem
				onClick={() => {
					setSelectedWallet(wallet);
					setIsOpen(false);
				}}
				key={`sentry-item-${i}`}
				dropdownOptionsCount={Object.values(combinedOwners).length}
			>
				{wallet}
			</DropdownItem>
		));
	}

	function copySelectedWallet() {
		if (selectedWallet && navigator.clipboard) {
			navigator.clipboard.writeText(selectedWallet)
				.then(() => {
					setCopiedSelectedWallet(true);
					setTimeout(() => {
						setCopiedSelectedWallet(false);
					}, 1500);
				})
				.catch(err => {
					log.error('Unable to copy to clipboard: ', err);
				});
		} else {
			log.error('Clipboard API not available, unable to copy to clipboard');
		}
	}

	return (
		<>
			{isRemoveWalletOpen && (
				<RemoveWalletModal
					onClose={() => setIsRemoveWalletOpen(false)}
					selectedWallet={selectedWallet}
					isWalletAssignedMap={isWalletAssignedMap}
				/>
			)}
			<div className="w-full flex flex-col gap-4">
				<div className="w-full h-auto flex flex-col py-3 pl-6">
					<p className="text-sm uppercase text-[#A3A3A3] mb-1 mt-2">
						View Wallet
					</p>
					<div className="relative flex flex-row gap-3 items-center">
						<div className="max-h-[48px]">
						<Dropdown
							isOpen={isOpen}
							setIsOpen={setIsOpen}
							selectedValue={selectedWallet}
							defaultValue={"All"}
							selectedValueRender={
								<p>{selectedWallet || `All wallets (${Object.keys(combinedOwners).length})`}</p>
							}
							setSelectedValue={setSelectedWallet}
							getDropdownItems={getDropdownItems}
							extraClasses={{dropdown: "max-w-[456px]"}}
							dropdownOptionsCount={Object.values(combinedOwners).length}
						/>
						</div>
                        <div>
						<PrimaryButton
							isDisabled={selectedWallet === null}
							onClick={copySelectedWallet}
							className={`flex justify-center !h-[48px] items-center !w-[155px] text-lg uppercase font-bold !py-1 !px-[10px] disabled:!h-[50px]`}
							btnText="Copy address"
							colorStyle="outline"
							icon={copiedSelectedWallet ? (<AiOutlineCheck className="h-[18px]"/>) : (<PiCopy className="h-[18px]"/>)}
						/>
						</div>
                        <div>
						<PrimaryButton
							onClick={() => setDrawerState(DrawerView.ViewKeys)}
							className={`flex flex-row-reverse group !w-[147px] !h-[50px] justify-center items-center gap-2 text-lg font-bold uppercase !py-1 !px-[14px]`}
							btnText="Add wallet"
							icon={<AiOutlinePlus className="h-[15px] w-[15px] group-hover:fill-hornetSting duration-200 easy in" color={"#ffffff"}/>}
						/>
						</div>
						<div>
						<PrimaryButton
							isDisabled={selectedWallet === null}
							onClick={() => setIsRemoveWalletOpen(true)}
							className={`flex flex-row-reverse justify-center items-center gap-2 !h-[48px] !w-[173px] text-lg uppercase font-bold !py-1 !px-[14px] disabled:!h-[50px]`}
							btnText="Remove wallet"
							colorStyle="outline"
							icon={<AiOutlineMinus className="h-[15px] w-[15px]"/>}
						/>
						</div>
					</div>
				</div>

				<div>
					<div className="flex">

						<div className="flex flex-col px-6">
							<div className="flex items-center gap-1 text-lg text-elementalGrey">
								<p>Accrued network rewards</p>
								<CustomTooltip
									header={"Claimed esXAI will appear in your wallet balance.\n"}
									content={"Once you pass KYC for a wallet, any accrued esXAI for that wallet will be claimed and reflected in your esXAI balance."}
									position="end"
									mouseOver={setMouseOverTooltip}
									extraClasses={{group: mouseOverTooltip ? "z-40" : "z-auto"}}
								>
									<HelpIcon width={14} height={14}/>
								</CustomTooltip>
							</div>
							<div className="flex items-center gap-2 font-semibold">
								<div>
									{singleWalletBalance ? (
										<div className={`flex gap-1 items-end`}>
											<p className="text-4xl text-white">
												{ethers.formatEther(singleWalletBalance.esXaiBalance)} esXAI
											</p>
										</div>
									) : (
										earnedEsxaiBalance ? (
											<div className={`flex gap-1 items-end`}>
												<p className="text-4xl text-white">
													{ethers.formatEther(
														earnedEsxaiBalance.reduce((acc, item) => acc + item.esXaiBalance, BigInt(0))
													)} esXAI
												</p>
											</div>
										) : (
											<p className="text-3xl text-white">
												Loading...
											</p>
										)
									)}

								</div>

							</div>
						</div>

						<div className="flex flex-col pl-10">
							<div className="flex items-center gap-1 text-lg text-elementalGrey">
							<p className="">Accrued esXAI (unclaimed)</p>
							<CustomTooltip
								header={"Each key will accrue esXAI. Pass KYC to claim."}
								content={"This value is the sum of all esXAI accrued for the selected wallet. If esXAI has already been claimed, it will appear in esXAI balance."}
								position="start"
								mouseOver={setMouseOverTooltip}
								extraClasses={{group: mouseOverTooltip ? "z-40" : "z-auto"}}
							>
								<HelpIcon width={14} height={14}/>
							</CustomTooltip>
							<p className="flex items-center text-[#726F6F] text-base ml-2">
								Last
								updated: {!isBalancesLoading && balancesFetchedLast ? balancesFetchedLast.toLocaleString() :
								<BiLoaderAlt className="animate-spin w-[18px]" color={"#FF0030"}/>}
							</p>
							</div>
							<div className="flex items-center gap-2 font-semibold">
								<div>
									{balances
										?
										<div className={`flex gap-1 items-end`}>
											<p className="text-4xl text-white">
												{ethers.formatEther(Object.values(balances).reduce((acc, value) => acc + value.totalAccruedEsXai, BigInt(0)))} esXAI
											</p>
										</div>
										: "Loading..."
									}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col max-h-[70vh]">
					<div className="w-full overflow-y-auto">
						<table className="w-full bg-nulnOil">
							<thead className="text-elementalGrey text-base sticky top-0 bg-nulnOil z-10">
							<tr className="flex items-center text-left text-base border-b border-t border-chromaphobicBlack pl-[25px] py-[15px] bg-dynamicBlack">
								<th className="min-w-[7%] pr-2 py-0">KEY ID</th>
								<th className="min-w-[39%] px-2 py-0">OWNER ADDRESS</th>
								<th className="min-w-[27%] px-4 py-0">STATUS</th>
								<th className="min-w-[15%] px-2 py-0 flex items-center justify-end gap-1">
									{isBalancesLoading &&
                                        <BiLoaderAlt className="animate-spin w-[18px]" color={"#FF0030"}/>}
									ACCRUED esXAI
								</th>
								<th className="min-w-[12%] pl-4 pr-2 py-0 text-right">OPENSEA URL</th>
							</tr>
							</thead>
							<tbody className="relative">{renderKeys()}</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	)
}
