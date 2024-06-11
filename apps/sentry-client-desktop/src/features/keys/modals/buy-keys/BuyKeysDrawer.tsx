import {AiOutlineClose} from "react-icons/ai";
import {BuyKeysFlow} from "./BuyKeysFlow.js";
import {drawerStateAtom} from "../../../drawer/DrawerManager";
import {useSetAtom} from "jotai";

export function BuyKeysDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	return (
		<div className="w-full h-full flex flex-col justify-start items-center">
			<div
				className="w-full h-16 min-h-[64px] flex flex-row justify-between items-center border-b border-primaryBorderColor text-2xl text-white font-bold px-6 py-7">
				<span>Purchase key</span>
				<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
					<AiOutlineClose size={20}/>
				</div>
			</div>

			<BuyKeysFlow/>
		</div>
	)
}
