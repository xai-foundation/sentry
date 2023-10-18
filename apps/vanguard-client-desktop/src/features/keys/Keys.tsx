import {useState} from "react";
import {HasKeys} from "./HasKeys.tsx";
import {NoKeys} from "./NoKeys.tsx";
import {BuyKeysModal} from "../modals/buy-keys/BuyKeysModal.tsx";

export function Keys() {
	const [number, setNumber] = useState<number>(0);
	const [showModal, setShowModal] = useState<boolean>(false);

	return (
		<div className="w-full h-screen">

			{/*		Keys Header		*/}
			<div
				className="sticky top-0 flex flex-row items-center w-full h-16 border-b border-gray-200 pl-10 gap-2 bg-white">
				<h2 className="text-lg">Keys</h2>
				<p className="text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
					{number} owned
				</p>
			</div>

			{showModal && (
				<BuyKeysModal
					number={number}
					setNumber={setNumber}
					setShowModal={setShowModal}
				/>
			)}

			{number ? (
				<HasKeys
					setShowModal={setShowModal}
				/>
			) : (
				<NoKeys
					setShowModal={setShowModal}
				/>
			)}
		</div>
	)
}
