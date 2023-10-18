import {FaCircleCheck} from "react-icons/fa6";
import {Dispatch, SetStateAction} from "react";

interface ViewKeySuccessProps {
	setShowModal: Dispatch<SetStateAction<boolean>>;
}

export function ViewKeySuccess({setShowModal}: ViewKeySuccessProps) {
	return (
		<div className="w-auto h-auto">
			<div className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
				<FaCircleCheck color={"#16A34A"} size={32}/>
				<span className="text-lg">Wallet added successfully</span>
			</div>

			<div className="absolute bottom-0 left-0 w-full p-6">
				<button
					onClick={() => setShowModal(false)}
					className="w-full h-16 bg-[#F30919] text-sm text-white p-2 uppercase font-semibold"
				>
					Continue
				</button>
			</div>
		</div>
	)
}
