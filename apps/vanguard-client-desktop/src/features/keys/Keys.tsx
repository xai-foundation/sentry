import {useState} from "react";
import {HasKeys} from "./HasKeys.tsx";
import {NoKeys} from "./NoKeys.tsx";
import {BuyKeysModal} from "./modals/buy-keys/BuyKeysModal.tsx";
import {ActionsRequiredModalManager} from "../home/modals/actions-required/ActionsRequiredModalManager.tsx";

export function Keys() {
	const [number, setNumber] = useState<number>(0);
	const [showBuyModal, setShowBuyModal] = useState<boolean>(false);

	return (
		<div className="w-full h-screen">
			<div
				className="sticky top-0 flex flex-row items-center w-full h-16 border-b border-gray-200 pl-10 gap-2 bg-white">
				<h2 className="text-lg">Keys</h2>
				<p className="text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
					{number} owned
				</p>
			</div>

			<ActionsRequiredModalManager/>

			{showBuyModal && (
				<BuyKeysModal
					number={number}
					setNumber={setNumber}
					setShowModal={setShowBuyModal}
				/>
			)}

			{number ? (
				<HasKeys
					setShowModal={setShowBuyModal}
				/>
			) : (
				<NoKeys
					setShowModal={setShowBuyModal}
				/>
			)}
		</div>
	)
}
