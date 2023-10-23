import {AiFillWarning} from "react-icons/ai";
import {useState} from "react";
import {ActionsRequiredModalManager} from "./modals/actions-required/ActionsRequiredModalManager.tsx";
import {BuyKeysModal} from "../keys/modals/buy-keys/BuyKeysModal.tsx";
import {ViewKeysModal} from "./modals/view-keys/ViewKeysModal.tsx";
import {ContinueInBrowserModal} from "./modals/ContinueInBrowserModal.tsx";
import {BiLinkExternal} from "react-icons/bi";

export function SentryWallet() {
	const [number, setNumber] = useState<number>(0);
	const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
	const [showViewModal, setShowViewModal] = useState<boolean>(false);
	const [showContinueInBrowserModal, setShowContinueInBrowserModal] = useState<boolean>(false);

	return (
		<div className="w-full h-screen">
			<div
				className="sticky top-0 flex flex-row items-center w-full h-16 border-b border-gray-200 pl-10 gap-2 bg-white">
				<h2 className="text-lg">Assigned Keys</h2>
				<p className="text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
					{number} keys in 0 (placeholder) wallets
				</p>
			</div>

			{!number && (
				<ActionsRequiredModalManager/>
			)}

			{showBuyModal && (
				<BuyKeysModal
					number={number}
					setNumber={setNumber}
					setShowModal={setShowBuyModal}
				/>
			)}

			{showViewModal && (
				<ViewKeysModal
					setShowViewModal={setShowViewModal}
					setShowContinueInBrowserModal={setShowContinueInBrowserModal}
				/>
			)}

			{showContinueInBrowserModal && (
				<ContinueInBrowserModal setShowContinueInBrowserModal={setShowContinueInBrowserModal}/>
			)}


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
						onClick={() => setShowViewModal(true)}
						className="flex justify-center items-center gap-1 text-[15px] text-white bg-[#F30919] font-semibold mt-2 px-6 py-3"
					>
						Assign keys from new wallet
						<BiLinkExternal className="w-5 h-5"/>
					</button>

					<p className="text-[15px] text-[#525252] mt-2">
						Don't own any keys?

						<a
							onClick={() => setShowBuyModal(true)}
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
