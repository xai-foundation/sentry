import {AiOutlinePlus} from "react-icons/ai";
import {useState} from "react";
import {BulkOwnerOrPool, config} from "@sentry/core";
import {CustomTooltip, PrimaryButton} from "@sentry/ui";
import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import {useAtomValue, useSetAtom} from "jotai";
import {RemoveWalletModal} from "@/features/home/modals/RemoveWalletModal";
import {WalletAssignedMap} from "@/features/keys/Keys";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {useOperator} from "@/features/operator";
import {ethers} from "ethers";
import {useGetWalletBalance} from "@/hooks/useGetWalletBalance";
import {useGetSingleWalletBalance} from "@/hooks/useGetSingleWalletBalance";
import {
	HelpIcon,
	KeyIcon,
} from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { InfoBanner } from "@/components/InfoBanner";
import { KeysTableBody } from "./KeysTableBody";
import { chainStateAtom } from "@/hooks/useChainDataWithCallback";

interface HasKeysProps {
	combinedOwners: string[],
	isWalletAssignedMap: WalletAssignedMap,
	operatorWalletData: BulkOwnerOrPool[]
}

export function HasKeys({ combinedOwners, isWalletAssignedMap, operatorWalletData }: HasKeysProps) {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);

	const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
	const [isRemoveWalletOpen, setIsRemoveWalletOpen] = useState<boolean>(false);
	const { isLoading: isOperatorLoading } = useOperator();

	const { data: earnedEsxaiBalance } = useGetWalletBalance(combinedOwners);
	const { data: singleWalletBalance } = useGetSingleWalletBalance(selectedWallet);
	const [mouseOverTooltip, setMouseOverTooltip] = useState(false);

	const {
		totalKeys
	} = useAtomValue(chainStateAtom);

	function startAssignment(wallet: string) {
		if (!isOperatorLoading) {
			setModalState(ModalView.TransactionInProgress);
			window.electron.openExternal(`${config.sentryKeySaleURI}/#/assign-wallet/${wallet}`);
		}
	}

	function onRemoveWallet(wallet: string) {
		setSelectedWallet(wallet);
		if(isWalletAssignedMap[wallet]){
			setModalState(ModalView.TransactionInProgress)
			window.electron.openExternal(`${config.sentryKeySaleURI}/#/unassign-wallet/${wallet}`);
			return;
		}
		setIsRemoveWalletOpen(true);
	}

	return (
		<>
			{isRemoveWalletOpen && (
				<RemoveWalletModal
					onClose={() => {
						setIsRemoveWalletOpen(false);
						setSelectedWallet("")
					}}
					selectedWallet={selectedWallet}
					isWalletAssignedMap={isWalletAssignedMap}
				/>
			)}
			<div className="w-full flex flex-col">
				<div>
					<div className="flex border-b-[2px] border-t-[2px] border-chromaphobicBlack bg-potBlack py-3">
						<div className="flex flex-col px-6">
							<div className="flex items-center gap-1 text-lg text-elementalGrey">
								<p>Total keys</p>
							</div>
							<div className="flex items-center gap-2">
								<div className="flex gap-[8px]">
									<KeyIcon extraClasses={"fill-darkRoom"} height={36} width={36} />
									<p className="text-4xl text-white whitespace-nowrap">{totalKeys} keys</p>
								</div>

							</div>
						</div>

						<div className="flex flex-col px-6">
							<div className="flex items-center gap-1 text-lg text-elementalGrey">
								<p>Accrued network rewards</p>
								<CustomTooltip
									header={"Claimed esXAI will appear in your wallet balance.\n"}
									content={"Once you pass KYC for a wallet, any accrued esXAI for that wallet will be claimed and reflected in your esXAI balance."}
									position="end"
									mouseOver={setMouseOverTooltip}
									extraClasses={{ group: mouseOverTooltip ? "z-40" : "z-auto" }}
								>
									<HelpIcon width={14} height={14} />
								</CustomTooltip>
							</div>
							<div className="flex items-center gap-2">
								<div>
									{singleWalletBalance ? (
										<div className={`flex gap-1 items-end`}>
											<p className="text-4xl text-white">
												{new Intl.NumberFormat('en').format(Number(ethers.formatEther(singleWalletBalance.esXaiBalance)))} esXAI
											</p>
										</div>
									) : (
										earnedEsxaiBalance ? (
											<div className={`flex gap-1 items-end`}>
												<p className="text-4xl text-white">
													{new Intl.NumberFormat('en').format(Number(ethers.formatEther(
														earnedEsxaiBalance.reduce((acc, item) => acc + item.esXaiBalance, BigInt(0))
													)))} esXAI
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

						{/* TODO this needs to be readded with #188241567 */}
						{/* <div className="flex flex-col pl-10">
							<div className="flex items-center gap-1 text-lg text-elementalGrey">
								<p className="">Accrued esXAI (unclaimed)</p>
								<CustomTooltip
									header={"Each key will accrue esXAI. Pass KYC to claim."}
									content={"This value is the sum of all esXAI accrued for the selected wallet. If esXAI has already been claimed, it will appear in esXAI balance."}
									position="start"
									mouseOver={setMouseOverTooltip}
									extraClasses={{ group: mouseOverTooltip ? "z-40" : "z-auto" }}
								>
									<HelpIcon width={14} height={14} />
								</CustomTooltip>

							</div>
							<div className="flex items-center gap-2">
								<div>
									{balances
										?
										<div className={`flex gap-1 items-end`}>
											<p className="text-4xl text-white">
												{ethers.formatEther(Object.values(balances).reduce((acc: bigint, value) => acc + (value as GetAccruedEsXaiResponse).totalAccruedEsXai, BigInt(0)))} esXAI
											</p>
										</div>
										: "Loading..."
									}
								</div>
							</div>
						</div> */}

					</div>
					<div className="px-5 pt-4">
						<InfoBanner
							heading="We've revamped how keys are shown on this page"
							description="This page now shows all your connected wallets, and their respective keys in a single view. "
							externalLink="https://xai-foundation.gitbook.io/xai-network"
						/>
					</div>

					<div className="w-full h-auto flex py-3 px-6 justify-between items-end">
						<p className="text-lg text-[#A3A3A3]">
							{operatorWalletData.length} connected wallets & pools
						</p>
						<div className="relative">
							<div>
								<PrimaryButton
									onClick={() => setDrawerState(DrawerView.ViewKeys)}
									wrapperClassName="keys-cta-button-clip-path"
									className={`flex flex-row-reverse group !w-[147px] !h-[50px] justify-center items-center gap-2 text-lg font-bold uppercase !py-1 !px-[14px]`}
									btnText="Add wallet"
									icon={<AiOutlinePlus
										className="h-[15px] w-[15px] group-hover:fill-hornetSting duration-200 easy in"
										color={"#ffffff"} />}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col max-h-[70vh]">
					<div className="w-full">
						<table className="w-full bg-nulnOil">
							<thead className="text-elementalGrey text-base sticky top-0 bg-nulnOil z-10">
								<tr className="flex items-center text-left text-lg border-b border-t border-chromaphobicBlack pl-[16px] py-[14px] bg-dynamicBlack">
									<th className="min-w-[26%] px-2 py-0 font-semibold">WALLET OR POOL</th>
									<th className="min-w-[15%] px-4 py-0 font-semibold">KEYS</th>
									<th className="min-w-[27%] px-4 py-0 font-semibold">STATUS</th>
									<th className="min-w-[25%] px-2 py-0 flex items-center justify-end gap-1 font-semibold">
										ACCRUED esXAI
									</th>
									<th className="min-w-[5%] pl-2 py-0 flex items-center justify-end gap-1 font-semibold">

									</th>
								</tr>
							</thead>
							<KeysTableBody
								operatorWalletData={operatorWalletData}
								isWalletAssignedMap={isWalletAssignedMap}
								startAssignment={startAssignment}
								onRemoveWallet={onRemoveWallet}
							/>
						</table>
					</div>
				</div>
			</div>

		</>
	)
}
