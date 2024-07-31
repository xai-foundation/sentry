import {AiOutlineClose} from "react-icons/ai";
import {ViewKeysFlow} from "./ViewKeysFlow.js";
import {useSetAtom} from "jotai";
import {drawerStateAtom} from "../../../drawer/DrawerManager";

export function ViewKeysDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	return (
		<div>
			<div
				className="h-full flex flex-col justify-start items-center">
				<div
					className="w-full flex flex-row justify-between items-center border-b border-chromaphobicBlack px-6 py-6">
					<span className="text-white text-2xl font-bold">View keys in wallet</span>
					<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
						<AiOutlineClose color={"white"} size={20}/>
					</div>
				</div>

				<ViewKeysFlow/>

			</div>
		</div>
	)
}
