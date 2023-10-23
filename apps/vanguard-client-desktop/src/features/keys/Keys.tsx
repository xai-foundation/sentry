import {useState} from "react";
import {HasKeys} from "./HasKeys.tsx";
import {NoKeys} from "./NoKeys.tsx";
import {BuyKeysModal} from "./modals/buy-keys/BuyKeysModal.tsx";
import {ActionsRequiredModalManager} from "../home/modals/actions-required/ActionsRequiredModalManager.tsx";
import {ViewKeysModal} from "../home/modals/view-keys/ViewKeysModal.tsx";
import {ContinueInBrowserModal} from "../home/modals/ContinueInBrowserModal.tsx";

export function Keys() {
	const [number, setNumber] = useState<number>(0);
	const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
	const [showViewModal, setShowViewModal] = useState<boolean>(false);
	const [showContinueInBrowserModal, setShowContinueInBrowserModal] = useState<boolean>(false);

	return (
		<div className="w-full h-screen">
			<div
				className="sticky top-0 flex flex-row items-center w-full h-16 border-b border-gray-200 pl-10 gap-2 bg-white">
				<h2 className="text-lg">Keys</h2>
				<p className="text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
					{number} owned
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

			{number ? (
				<HasKeys
					setShowModal={setShowBuyModal}
				/>
			) : (
				<NoKeys
					setShowBuyModal={setShowBuyModal}
					setShowViewModal={setShowViewModal}
				/>
			)}
		</div>
	)
}
