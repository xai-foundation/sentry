import {AiFillWarning, AiOutlineCheck, AiOutlineInfoCircle} from "react-icons/ai";
import {useEffect, useState} from "react";
import {ContinueInBrowserModal} from "./modals/ContinueInBrowserModal.tsx";
import {BiDownload, BiLinkExternal, BiUpload} from "react-icons/bi";
import {useOperator} from "../operator";
import {PiCopy} from "react-icons/pi";
import {HiOutlineDotsVertical} from "react-icons/hi";
import {GiPauseButton} from "react-icons/gi";
import {FaEthereum} from "react-icons/fa";
import {MdRefresh} from "react-icons/md";
import {useAtom} from "jotai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager.tsx";
import {FaPlay} from "react-icons/fa6";
import {IoIosArrowDown} from "react-icons/io";
import {operatorRuntime} from "@xai-vanguard-node/core";

const dummySentryWalletData = [
	{
		ownerAddress: "0xBAbeCCc528725ab1BFe7EEB6971FD7dbdd65cd85",
		status: "Waiting for challenge",
		accruedEsxai: "0.00123",
		openseaUrl: "https://xai.games/",
	},
	{
		ownerAddress: "0xBAbeCCc528725ab1BFe7EEB6971FD7dbdd65cd85",
		status: "Submitting claim",
		accruedEsxai: "0.00239",
		openseaUrl: "https://xai.games/",
	},
	{
		ownerAddress: "0xBAbeCCc528725ab1BFe7EEB6971FD7dbdd65cd85",
		status: "Checking claim",
		accruedEsxai: "0.00239",
		openseaUrl: "https://xai.games/",
	},
	{
		ownerAddress: "0xBAbeCCc528725ab1BFe7EEB6971FD7dbdd65cd85",
		status: "Claim submitted",
		accruedEsxai: "0.00239",
		openseaUrl: "https://xai.games/",
	},
]

const dropdownBody = [
	"All",
	"0xBAbeCCc528725ab1BFe7EEB6971FD7dbdd65cd85",
	"Fake data lol",
]

export function SentryWallet() {
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);
	const [showContinueInBrowserModal, setShowContinueInBrowserModal] = useState<boolean>(false);
	const {loading, publicKey, signer} = useOperator();
	const [copied, setCopied] = useState<boolean>(false);

	// update / swap this out with actual number of keys user owns
	const [number, setNumber] = useState<number>(0);
	// update this with actual state of Operator
	const [running, setRunning] = useState<boolean>(false);

	// dropdown state
	const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedWallet, setSelectedWallet] = useState<string>("");
	let stopFunction: () => Promise<void>;

	useEffect(() => {
		setSelectedWallet(dropdownBody[0]);
	}, []);

	function copyPublicKey() {
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
		return dropdownBody.map((item, i) => (
			<p
				key={`sentry-item-${i}`}
				className="p-2 cursor-pointer hover:bg-gray-100"
				onClick={() => {
					setSelectedWallet(item);
					setIsOpen(false);
				}}
			>
				{item}
			</p>
		))
	}

	function getKeys() {
		return dummySentryWalletData.map((item, i: number) => {
			const isEven = i % 2 === 0;

			return (
				<tr className={`${isEven ? "bg-[#FAFAFA]" : "bg-white"} flex px-8 text-sm`} key={`license-${i}`}>
					<td className="w-full max-w-[70px] px-4 py-2">{i + 1}</td>
					<td className="w-full max-w-[390px] px-4 py-2">{item.ownerAddress}</td>
					<td className="w-full max-w-[390px] px-4 py-2 text-[#A3A3A3]">{item.status}</td>
				</tr>
			)
		})
	}

	return (
		<div className="w-full h-screen">
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
								{loading ? "Loading..." : publicKey}
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
								className="ml-4 flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2"
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
								<span className="text-[#B45317] text-[15px] font-semibold">Actions required (N A)</span>
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
						{number} keys in 0 (placeholder) wallets
					</p>
					<AiOutlineInfoCircle className="text-[#A3A3A3]"/>
				</div>
			</div>

			{showContinueInBrowserModal && (
				<ContinueInBrowserModal setShowContinueInBrowserModal={setShowContinueInBrowserModal}/>
			)}


			{/*		Keys	*/}
			{number ? (
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
										<p>{selectedWallet}</p>
										<IoIosArrowDown
											className={`h-[15px] transform ${isOpen ? "rotate-180 transition-transform ease-in-out duration-300" : "transition-transform ease-in-out duration-300"}`}
										/>
									</div>

									{isOpen && (
										<div
											className="absolute flex flex-col w-[538px] border-r border-l border-b border-[#A3A3A3] bg-white">
											{getDropdownItems()}
										</div>
									)}
								</div>

								<button
									onClick={() => copyPublicKey()}
									className={`flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] ${selectedWallet === "All" ? 'text-[#D4D4D4] cursor-not-allowed' : ""} px-4 py-2`}
									disabled={selectedWallet === "All"}
								>
									{copied ? <AiOutlineCheck className="h-[15px]"/> : <PiCopy className="h-[15px]"/>}
									Copy address
								</button>


								<button
									onClick={() => window.electron.openExternal('http://localhost:7555/assign-wallet')}
									className="flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] px-4 py-2"
								>
									Assign keys from new wallet
									<BiLinkExternal className="h-[15px]"/>
								</button>

								<button
									onClick={() => window.electron.openExternal("https://xai.games/")}
									className={`flex flex-row justify-center items-center gap-2 text-[15px] border border-[#E5E5E5] ${selectedWallet === "All" ? 'text-[#D4D4D4] cursor-not-allowed' : ""} px-4 py-2`}
									disabled={selectedWallet === "All"}
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

								{getKeys()}

								<tr className="text-[#A3A3A3] text-sm flex px-8">
									<td className="w-full max-w-[70px] px-4 py-2">-</td>
									<td className="w-full max-w-[390px] px-4 py-2">Empty Key Slot</td>
								</tr>
								</tbody>
							</table>
						</div>
					</div>
				</>
			) : (
				<>
					<div className="w-full h-auto flex flex-col justify-center items-center">
						<div className="absolute top-0 bottom-0 flex flex-col justify-center items-center gap-4">
							<AiFillWarning className="w-16 h-16 text-[#F59E28]"/>
							<p className="text-2xl font-semibold">
								Keys not assigned
							</p>
							<p className="text-lg text-[#525252]">
								Add wallets to assign keys to the Sentry
							</p>

							<button
								onClick={() => window.electron.openExternal('http://localhost:7555/assign-wallet')}
								className="flex justify-center items-center gap-1 text-[15px] text-white bg-[#F30919] font-semibold mt-2 px-6 py-3"
							>
								Assign keys from new wallet
								<BiLinkExternal className="w-5 h-5"/>
							</button>

							<p className="text-[15px] text-[#525252] mt-2">
								Don't own any keys?

								<a
									onClick={() => setDrawerState(DrawerView.BuyKeys)}
									className="text-[#F30919] ml-1 cursor-pointer"
								>
									Purchase keys
								</a>
							</p>
						</div>
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
		</div>
	)
}
