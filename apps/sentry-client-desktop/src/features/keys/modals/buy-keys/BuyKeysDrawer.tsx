import {AiOutlineClose} from "react-icons/ai";
import {BuyKeysFlow} from "./BuyKeysFlow.js";
import {drawerStateAtom} from "../../../drawer/DrawerManager";
import {useSetAtom} from "jotai";

export function BuyKeysDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	return (
		<div className="w-full h-full flex flex-col justify-start items-center">
			<div
				className="w-full flex flex-row justify-between items-center border-b border-chromaphobicBlack text-2xl text-white font-bold px-6 py-6">
				<span>Purchase key</span>
				<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
					<AiOutlineClose size={20} color="white" className="hover:!text-hornetSting duration-300 ease-in" />
				</div>
			</div>

			<BuyKeysFlow/>
		</div>
	)
}
