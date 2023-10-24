import {AiFillWarning, AiOutlineCheck, AiOutlineInfoCircle} from "react-icons/ai";
import {useState} from "react";
import {ContinueInBrowserModal} from "./modals/ContinueInBrowserModal.tsx";
import {BiLinkExternal} from "react-icons/bi";
import {useOperator} from "../operator";
import {PiCopy} from "react-icons/pi";
import {HiOutlineDotsVertical} from "react-icons/hi";
import {GiPauseButton} from "react-icons/gi";
import {FaEthereum} from "react-icons/fa";
import {MdRefresh} from "react-icons/md";
import {useAtom} from "jotai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager.tsx";

export function SentryWallet() {
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);

	const [number, setNumber] = useState<number>(0);
	const [showContinueInBrowserModal, setShowContinueInBrowserModal] = useState<boolean>(false);
	const {loading, publicKey} = useOperator();

	const [copied, setCopied] = useState<boolean>(false);

	function copyPrivateKey() {
		if (publicKey && navigator.clipboard) {
			navigator.clipboard.writeText(publicKey)
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

	return (
		<div className="w-full h-screen">
			<div
				className="sticky top-0 flex flex-col items-center w-full h-auto bg-white z-10">
				<div className="flex flex-row justify-between items-center w-full py-3 gap-2 border-b border-gray-200 pl-10">
					<div className="flex flex-row items-center gap-2">
						<h2 className="text-lg font-semibold">Sentry Wallet</h2>

						<p className="border border-[#D9771F] bg-[#FEFCE8] text-[#D9771F] text-xs font-semibold uppercase rounded-full px-2">
							No ETH
						</p>
						<p className="border border-[#D9771F] bg-[#FEFCE8] text-[#D9771F] text-xs font-semibold uppercase rounded-full px-2">
							No Keys Assigned
						</p>

						<div className="flex flex-row items-center gap-2 text-[#A3A3A3] text-[15px]">
							<p>
								{loading ? "Loading..." : publicKey}
							</p>

							<div
								onClick={() => copyPrivateKey()}
								className="cursor-pointer"
							>
								{copied
									? (<AiOutlineCheck/>)
									: (<PiCopy/>)}
							</div>


							<AiOutlineInfoCircle/>
							<HiOutlineDotsVertical/>
						</div>

						<button
							onClick={() => window.electron.openExternal('http://localhost:7555/')}
							className="ml-4 flex flex-row justify-center items-center gap-1 text-[15px] border border-[#E5E5E5] px-4 py-2"
						>
							<GiPauseButton className="h-[15px]"/>
							Pause Sentry
						</button>
					</div>


					{!number && drawerState === null && (
						<div className="flex gap-4 bg-[#FFFBEB] p-2 z-10">
							<div className="flex flex-row gap-2 items-center">
								<AiFillWarning className="w-7 h-7 text-[#F59E28]"/>
								<span className="text-[#B45317] text-[15px] font-semibold">Actions required</span>
							</div>
							<button
								onClick={() => setDrawerState(DrawerView.ActionsRequired)}
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

			{
				showContinueInBrowserModal && (
					<ContinueInBrowserModal setShowContinueInBrowserModal={setShowContinueInBrowserModal}/>
				)
			}


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
						onClick={() => setDrawerState(DrawerView.ViewKeys)}
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
		</div>
	)
}
