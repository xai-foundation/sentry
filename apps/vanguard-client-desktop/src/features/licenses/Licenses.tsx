import {useState} from "react";
import {HasLicenses} from "./HasLicenses.tsx";
import {NoLicenses} from "./NoLicenses.tsx";

export function Licenses() {
	const [number, setNumber] = useState<number>(0);

	return (
		<div className="w-full h-screen">

			{/*		Licenses Header		*/}
			<div className="sticky top-0 flex flex-row items-center w-full h-16 border-b border-gray-200 pl-10 gap-2 bg-white">
				<h2 className="text-lg">Licenses</h2>
				<p className="text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
					{number} owned
				</p>
			</div>

			{number ? (
				<HasLicenses/>
			) : (
				<NoLicenses
					number={number}
					setNumber={setNumber}
				/>
			)}

		</div>
	)
}
