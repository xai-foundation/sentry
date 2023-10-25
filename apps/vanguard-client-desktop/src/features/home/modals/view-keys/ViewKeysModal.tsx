import {AiOutlineClose} from "react-icons/ai";
import {ViewKeysFlow} from "./ViewKeysFlow.tsx";
import {useSetAtom} from "jotai";
import {drawerStateAtom} from "../../../drawer/DrawerManager";
import {ContinueInBrowserModal} from "../ContinueInBrowserModal.tsx";
import {useState} from "react";

export function ViewKeysModal() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const [isOpen, setIsOpen] = useState<boolean>(false)

	return (
		<div>
			<div
				className="absolute top-0 right-0 w-[30rem] h-screen flex flex-col justify-start items-center border border-gray-200 z-20 bg-white">
				<div
					className="absolute top-0 w-full h-16 flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
					<span>View keys in wallet</span>
					<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
						<AiOutlineClose/>
					</div>
				</div>

				<ViewKeysFlow
					setShowContinueInBrowserModal={setIsOpen}
				/>


			</div>

			{/*		todo: implementing this way until better solution is needed		*/}
			{isOpen && (
				<div className="fixed top-0 right-0 bottom-0 left-0 m-auto z-30">
					<ContinueInBrowserModal setShowContinueInBrowserModal={setIsOpen}/>
				</div>
			)}
		</div>
	)
}
