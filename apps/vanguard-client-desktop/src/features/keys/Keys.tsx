import {useState} from "react";
import {HasKeys} from "./HasKeys.js";
import {NoKeys} from "./NoKeys.js";
import {ContinueInBrowserModal} from "../home/modals/ContinueInBrowserModal.js";
import {AiFillWarning, AiOutlineInfoCircle} from "react-icons/ai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";
import {useAtom} from "jotai";
import {Tooltip} from "@/features/keys/Tooltip";

export function Keys() {
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);
	const [number, setNumber] = useState<number>(0);
	const [showContinueInBrowserModal, setShowContinueInBrowserModal] = useState<boolean>(false);

	return (
		<div className="w-full h-screen">
			<div className="flex flex-row justify-between items-center border-b border-gray-200 pl-10 pr-2">
				<div className="w-full sticky top-0 flex flex-row items-center h-16 gap-2 bg-white">
					<h2 className="text-lg">Keys</h2>
					<p className="text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
						{number} keys in 1 wallet
					</p>
					<Tooltip
						header={"Xai Client can track keys only from added wallets"}
						body={"If you own keys in additional wallets, add them to the client."}
					>
						<AiOutlineInfoCircle size={16} className="text-[#A3A3A3]"/>
					</Tooltip>
				</div>

				{!number && drawerState === null && (
					<div className="flex gap-4 bg-[#FFFBEB] p-2 z-10">
						<div className="flex flex-row gap-2 items-center">
							<AiFillWarning className="w-7 h-7 text-[#F59E28]"/>
							<span className="text-[#B45317] text-[15px] font-semibold">Actions required (Buy)</span>
						</div>
						<button
							onClick={() => setDrawerState(DrawerView.ActionsRequiredBuy)}
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
				<NoKeys setNumber={setNumber}/>
			)}
		</div>
	)
}
