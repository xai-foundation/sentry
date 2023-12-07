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
					className="absolute top-0 w-full h-[4rem] flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
					<span>View keys in wallet</span>
					<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
						<AiOutlineClose/>
					</div>
				</div>

				<ViewKeysFlow/>

			</div>
		</div>
	)
}
