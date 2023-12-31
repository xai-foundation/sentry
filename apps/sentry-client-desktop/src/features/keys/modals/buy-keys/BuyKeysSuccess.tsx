import {FaCircleCheck} from "react-icons/fa6";
import {useSetAtom} from "jotai";
import {drawerStateAtom} from "../../../drawer/DrawerManager.js";

export function BuyKeysSuccess() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	return (
		<div className="w-auto h-auto">
			<div
				className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
				<FaCircleCheck color={"#F30919"} size={64}/>
				<span className="text-2xl font-semibold">Purchase successful!</span>
				<span className="text-lg">You can now start earning network rewards</span>
			</div>

			<div className="absolute bottom-0 left-0 w-full p-6">
				<button
					onClick={() => setDrawerState(null)}
					className="w-full h-16 bg-[#F30919] text-sm text-white p-2 uppercase font-semibold"
				>
					Continue
				</button>
			</div>
		</div>
	)
}
