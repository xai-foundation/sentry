import {AiFillWarning, AiOutlineClose} from "react-icons/ai";
import {RiKey2Line} from "react-icons/ri";
import {IoMdCloseCircle} from "react-icons/io";
import {useSetAtom} from "jotai";
import {drawerStateAtom, DrawerView} from "../../../drawer/DrawerManager";

export function ActionsRequiredBuyDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	return (
		<div className="h-full flex flex-col justify-start items-center">
			<div
				className="w-full h-[4rem] flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
				<div className="flex flex-row gap-2 items-center">
					<AiFillWarning className="w-7 h-7 text-[#F59E28]"/> <span>Actions required</span>
				</div>
				<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
					<AiOutlineClose/>
				</div>
			</div>

			<div className="w-full flex flex-col gap-4 px-6 pt-[1rem]">
				<div className="flex flex-col gap-2 bg-[#FFFBEB] p-6">
					<span className="flex flex-row gap-1 items-center font-semibold">
						<IoMdCloseCircle size={22} color={"#F59E28"}/> You do not own a key
					</span>
					<p className="text-[15px] text-[#924012]">
						No Xai Sentry Node Keys found in all added wallets
					</p>

					<div className="pb-2 font-semibold">
						<button
							onClick={() => setDrawerState(DrawerView.BuyKeys)}
							className={`w-full h-10 flex flex-row justify-center items-center gap-1 bg-[#F30919] text-[15px] text-white`}
						>
							<RiKey2Line className="w-5 h-5"/>
							Purchase keys
						</button>
					</div>

					<p className="text-[15px] text-[#924012]">
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
		</div>
	)
}
