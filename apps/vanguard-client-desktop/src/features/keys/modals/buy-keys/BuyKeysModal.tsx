import {AiOutlineClose} from "react-icons/ai";
import {BuyKeysFlow} from "./BuyKeysFlow.tsx";
import {drawerStateAtom} from "../../../drawer/DrawerManager";
import {useSetAtom} from "jotai";

export function BuyKeysModal() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	return (
		<div className="w-full h-full flex flex-col justify-start items-center border border-gray-200 z-20 bg-white">
			<div
				className="w-full h-16 min-h-[64px] flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
				<span>Purchase key</span>
				<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
					<AiOutlineClose/>
				</div>
			</div>

			<BuyKeysFlow/>
		</div>
	)
}
