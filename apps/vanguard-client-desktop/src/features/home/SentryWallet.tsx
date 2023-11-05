import {AiFillWarning, AiOutlineCheck, AiOutlineInfoCircle} from "react-icons/ai";
import {useState} from "react";
import {ContinueInBrowserModal} from "./modals/ContinueInBrowserModal.js";
import {BiDownload, BiLinkExternal, BiUpload} from "react-icons/bi";
import {useOperator} from "../operator";
import {PiCopy} from "react-icons/pi";
import {HiOutlineDotsVertical} from "react-icons/hi";
import {GiPauseButton} from "react-icons/gi";
import {FaEthereum} from "react-icons/fa";
import {MdRefresh} from "react-icons/md";
import {useAtom} from "jotai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager.js";
import {FaPlay} from "react-icons/fa6";
import {IoIosArrowDown} from "react-icons/io";
import {AssignKeysFromNewWallet} from "../../components/AssignKeysFromNewWallet";
import {useListOwnersForOperator} from "../../hooks/useListOwnersForOperator";
import {useListNodeLicenses} from "../../hooks/useListNodeLicenses";
import {operatorRuntime} from "@xai-vanguard-node/core";
import {WalletConnectedModal} from "@/features/home/modals/WalletConnectedModal";
import {useQueryClient} from "react-query";

export function SentryWallet() {
	// todo -> split up
	const queryClient = useQueryClient();
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);
	const [showContinueInBrowserModal, setShowContinueInBrowserModal] = useState<boolean>(false);
	const {loading: isOperatorLoading, publicKey: operatorAddress, signer} = useOperator();
	const {isLoading: isListOwnersLoading, data: listOwnersData} = useListOwnersForOperator(operatorAddress);
	const {
		isLoading: isListNodeLicensesLoading,
		data: listNodeLicensesData
	} = useListNodeLicenses(listOwnersData?.owners);
	const loading = isOperatorLoading || isListOwnersLoading || isListNodeLicensesLoading;
	const [copied, setCopied] = useState<boolean>(false);
	const [assignedWallet, setAssignedWallet] = useState<{ show: boolean, txHash: string }>({show: false, txHash: ""});
	const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

	console.log("listNodeLicensesData:", listNodeLicensesData);
	(window as any).deeplinks?.assignedWallet((_event, txHash) => {
		setAssignedWallet({show: true, txHash});
	});

	// update / swap this out with actual number of keys user owns
	const [number, setNumber] = useState<number>(0);
	// update this with actual state of Operator
	const [running, setRunning] = useState<boolean>(false);

	// dropdown state
	const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	let stopFunction: () => Promise<void>;

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
		void navigator.clipboard.writeText(selectedWallet!);
	}

	async function startSentry() {
		if (signer && number > 0) {
			// @ts-ignore
			stopFunction = await operatorRuntime(signer, undefined, (log) => console.log(log));
			setRunning(true);
			// @ts-ignore
			return new Promise((resolve, reject) => {
			}); // Keep the command alive
		}
	}

	async function pauseSentry() {
		if (stopFunction) {
			await stopFunction();
			setRunning(false);
		}
		if (!stopFunction) {
			console.warn("stopFunction is undefined!")
		}
		setRunning(false);
	}

	function getDropdownItems() {
		return listOwnersData!.owners.map((wallet, i) => (
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
		const keysWithOwners: Array<{ owner: string, key: bigint }> = [];

		// Get keys from every assigned wallet if "All" is selected in the drop down
		if (selectedWallet === null) {
			Object.keys(listNodeLicensesData!.licenses).map((owner) => {
				listNodeLicensesData!.licenses[owner].forEach((license) => {
					keysWithOwners.push({owner, key: license});
				});
			});
		} else {
			listNodeLicensesData!.licenses[selectedWallet].forEach((license) => {
				keysWithOwners.push({owner: selectedWallet, key: license});
			});
		}

		if (keysWithOwners.length === 0) {
			return (
				<tr className="bg-white flex px-8 text-sm">
					<td colSpan={3} className="w-full text-center">No keys found.</td>
				</tr>
			);
		}

		return keysWithOwners.map((keyWithOwner, i: number) => {
			const isEven = i % 2 === 0;

			return (
				<tr className={`${isEven ? "bg-[#FAFAFA]" : "bg-white"} flex px-8 text-sm`} key={`license-${i}`}>
					<td className="w-full max-w-[70px] px-4 py-2">{keyWithOwner.key.toString()}</td>
					<td className="w-full max-w-[390px] px-4 py-2">{keyWithOwner.owner.toString()}</td>
					<td className="w-full max-w-[390px] px-4 py-2 text-[#A3A3A3]">Placeholder</td>
				</tr>
			);
		});
	}

	function onCloseWalletConnectedModal() {
		setAssignedWallet({show: false, txHash: ""});
		queryClient.invalidateQueries({queryKey: ["ownersForOperator", operatorAddress]});
	}

	return (
		<>
			{assignedWallet.show && (
				<WalletConnectedModal
					txHash={assignedWallet.txHash}
					onClose={onCloseWalletConnectedModal}
				/>
			)}

			<div className="w-full h-full flex flex-col">
				<div
					className="sticky top-0 flex flex-col items-center w-full h-auto bg-white z-10">
					<div
						className="flex flex-row justify-between items-center w-full py-3 gap-2 border-b border-gray-200 pl-10">
						<div className="flex flex-row items-center gap-2">
							<h2 className="text-lg font-semibold">Sentry Wallet</h2>

							{running ? (
								<>
									<p className="border border-[#D9771F] bg-[#FEFCE8] text-[#D9771F] text-xs font-semibold uppercase rounded-full px-2">
										No ETH
									</p>
									<p className="border border-[#D9771F] bg-[#FEFCE8] text-[#D9771F] text-xs font-semibold uppercase rounded-full px-2">
										No Keys Assigned
									</p>
								</>
							) : (
								<p className="border border-[#F5F5F5] bg-[#F5F5F5] text-[#A3A3A3] text-xs font-semibold uppercase rounded-full px-2">
									Stopped
								</p>
							)}

							<div className="flex flex-row items-center gap-2 text-[#A3A3A3] text-[15px]">
								<p>
									{isOperatorLoading ? "Loading..." : operatorAddress}
								</p>

								<div
									onClick={() => copyPublicKey()}
									className="cursor-pointer"
								>
									{copied
										? (<AiOutlineCheck/>)
										: (<PiCopy/>)}
								</div>


								<AiOutlineInfoCircle/>

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

							{running ? (
								<button
									onClick={() => pauseSentry()}
									className="ml-4 flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2"
								>
									<GiPauseButton className="h-[15px]"/>
									Pause Sentry
								</button>
							) : (
								<button
									onClick={() => startSentry()}
									className={`ml-4 flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2 ${!number ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''}`}
									disabled={!number}
								>
									<FaPlay className="h-[15px]"/>
									Start Sentry
								</button>
							)}
						</div>

						{!number && drawerState === null && (
							<div className="flex gap-4 bg-[#FFFBEB] p-2 z-10">
								<div className="flex flex-row gap-2 items-center">
									<AiFillWarning className="w-7 h-7 text-[#F59E28]"/>
									<span
										className="text-[#B45317] text-[15px] font-semibold">Actions required (N A)</span>
								</div>
								<button
									onClick={() => setDrawerState(DrawerView.ActionsRequiredNotAccruing)}
									className={`flex flex-row justify-center items-center py-1 px-4 gap-1 bg-[#F30919] text-[15px] text-white font-semibold`}
								>
									Resolve
								</button>
							</div>
						)}
					</div>

					<div className="flex flex-col items-start w-full border-b border-gray-200 gap-2 py-2 pl-10">
						<div className="flex items-center gap-1">
							<h2 className="font-semibold">Sentry Wallet Balance</h2>
							<AiOutlineInfoCircle className="text-[#A3A3A3]"/>
						</div>

						<div className="flex justify-center items-center gap-4">
							<div className="flex justify-center items-center gap-1">
								<FaEthereum className="w-6 h-6"/>
								<p className="text-[#F29E0D] text-2xl font-semibold">0 ETH</p>
							</div>
							<a
								onClick={() => alert("nothing yet")}
								className="flex items-center text-[15px] text-[#F30919] gap-1 cursor-pointer"
							>
								<MdRefresh/> Refresh
							</a>
						</div>
					</div>

					<div className="flex flex-row items-center w-full py-3 pl-10 gap-1">
						<h2 className="font-semibold">Assigned Keys</h2>
						<p className="text-sm bg-gray-100 px-2 rounded-2xl text-gray-500">
							{loading ? "Loading..." : `${listNodeLicensesData!.totalLicenses} key${listNodeLicensesData!.totalLicenses === 1 ? "" : "s"} in ${listOwnersData!.owners.length} wallet${listOwnersData!.owners.length === 1 ? "" : "s"}`}
						</p>
						<AiOutlineInfoCircle className="text-[#A3A3A3]"/>
					</div>
				</div>

				{showContinueInBrowserModal && (
					<ContinueInBrowserModal setShowContinueInBrowserModal={setShowContinueInBrowserModal}/>
				)}

				{/*		Keys	*/}
				{listOwnersData && listOwnersData.owners && listOwnersData.owners.length > 3 ? (
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
											<p>{selectedWallet || "All"}</p>
											<IoIosArrowDown
												className={`h-[15px] transform ${isOpen ? "rotate-180 transition-transform ease-in-out duration-300" : "transition-transform ease-in-out duration-300"}`}
											/>
										</div>

										{isOpen && (
											<div
												className="absolute flex flex-col w-[538px] border-r border-l border-b border-[#A3A3A3] bg-white">
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
										className="flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2"
									>

										{copied
											? (<AiOutlineCheck className="h-[15px]"/>)
											: (<PiCopy className="h-[15px]"/>)
										}
										Copy address
									</button>

									<button
										onClick={() => window.electron.openExternal(`http://localhost:7555/assign-wallet/${operatorAddress}`)}
										className="flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2"
									>
										Assign keys from new wallet
										<BiLinkExternal className="h-[15px]"/>
									</button>

									<button
										disabled={selectedWallet === null}
										onClick={() => window.electron.openExternal("https://xai.games/")}
										className="flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2"
									>
										Unassign this wallet
										<BiLinkExternal className="h-[15px]"/>
									</button>
								</div>

							</div>

							<div className="w-full">
								<table className="w-full bg-white">
									<thead className="text-[#A3A3A3]">
										<tr className="flex text-left text-[12px] uppercase px-8">
											<th className="w-full max-w-[70px] px-4 py-2">Key Id</th>
											<th className="w-full max-w-[390px] px-4 py-2">Owner Address</th>
											<th className="w-full max-w-[390px] px-4 py-2">Claim Status</th>
										</tr>
									</thead>
									<tbody>
										{loading ? (
											<tr className="text-[#A3A3A3] text-sm flex px-8">
												<td colSpan={3} className="w-full text-center">Loading...</td>
											</tr>
										) : getKeys()}

										{/*<tr className="text-[#A3A3A3] text-sm flex px-8">*/}
										{/*	<td className="w-full max-w-[70px] px-4 py-2">-</td>*/}
										{/*	<td className="w-full max-w-[390px] px-4 py-2">Empty Key Slot</td>*/}
										{/*</tr>*/}
									</tbody>
								</table>
							</div>
						</div>
					</>
				) : (
					<>
						{loading ? (
							<div className="w-full flex-1 flex flex-col justify-center items-center">
								<h3 className="text-center">Loading...</h3>
							</div>
						) : (
							<>
								<div className="w-full flex-1 flex flex-col justify-center items-center">
									<AssignKeysFromNewWallet/>
								</div>

								{/*		todo: debug tool - delete this		*/}
								<div
									className="absolute bottom-0 right-0 p-4 cursor-pointer"
									onClick={() => setNumber(1)}
								>
									+1 Key
								</div>
							</>
						)}
					</>
				)}
			</div>
		</>
	);
}
