import {AiFillWarning} from "react-icons/ai";
import {useSetAtom} from "jotai";
import {RiKey2Line} from "react-icons/ri";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";

export function NoKeys() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	return (
		<div className="w-full h-auto flex flex-col justify-center items-center">
			<div className="absolute top-0 bottom-0 flex flex-col justify-center items-center gap-4">
				<AiFillWarning className="w-16 h-16 text-[#F59E28]"/>
				<p className="text-2xl font-semibold">
					You do not own any keys
				</p>
				<p className="text-lg text-[#525252]">
					Purchase a key to be able to begin accruing esXAI
				</p>

				<button
					onClick={() => setDrawerState(DrawerView.BuyKeys)}
					className="flex justify-center items-center gap-1 text-[15px] text-white bg-[#F30919] font-semibold mt-2 px-6 py-3"
				>
					<RiKey2Line className="w-5 h-5"/>
					Purchase keys
				</button>

				<p className="text-[15px] text-[#525252] mt-2">
					Already own a key?

					<a
						onClick={() => setDrawerState(DrawerView.ViewKeys)}
						className="text-[#F30919] ml-1 cursor-pointer"
					>
						Add wallet to Xai Client
					</a>
				</p>
			</div>
		</div>
	)
}
