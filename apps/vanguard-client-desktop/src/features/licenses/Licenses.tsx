import {useState} from "react";
import {HasLicenses} from "./HasLicenses.tsx";
import {NoLicenses} from "./NoLicenses.tsx";
import {BuyLicenseModal} from "../modals/buy-license/BuyLicenseModal.tsx";

export function Licenses() {
	const [number, setNumber] = useState<number>(0);
	const [showModal, setShowModal] = useState<boolean>(false);

	return (
		<div className="w-full h-screen">

			{/*		Licenses Header		*/}
			<div
				className="sticky top-0 flex flex-row items-center w-full h-16 border-b border-gray-200 pl-10 gap-2 bg-white">
				<h2 className="text-lg">Licenses</h2>
				<p className="text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
					{number} owned
				</p>
			</div>

			{showModal && (
				<BuyLicenseModal
					number={number}
					setNumber={setNumber}
					setShowModal={setShowModal}
				/>
			)}

			{number ? (
				<HasLicenses
					setShowModal={setShowModal}
				/>
			) : (
				<NoLicenses
					setShowModal={setShowModal}
				/>
			)}
		</div>
	)
}
