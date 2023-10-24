import {useState} from "react";
import {HasKeys} from "./HasKeys.tsx";
import {NoKeys} from "./NoKeys.tsx";
import {ContinueInBrowserModal} from "../home/modals/ContinueInBrowserModal.tsx";
import {AiFillWarning} from "react-icons/ai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";
import {useAtom} from "jotai";

export function Keys() {
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);
	const [number, setNumber] = useState<number>(0);
	const [showContinueInBrowserModal, setShowContinueInBrowserModal] = useState<boolean>(false);

	return (
		<div className="w-full h-screen">
			<div className="flex flex-row justify-between border-b border-gray-200">
				<div className="sticky top-0 flex flex-row items-center h-16 pl-10 gap-2 bg-white">
					<h2 className="text-lg">Keys</h2>
					<p className="text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
						{number} owned
					</p>
				</div>

				{!number && drawerState === null && (
					<div className="flex gap-4 bg-[#FFFBEB] p-2 m-2 z-10">
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

			{showContinueInBrowserModal && (
				<ContinueInBrowserModal setShowContinueInBrowserModal={setShowContinueInBrowserModal}/>
			)}

			{number ? (
				<HasKeys/>
			) : (
				<NoKeys/>
			)}
		</div>
	)
}
