import {AiFillWarning, AiOutlineClose} from "react-icons/ai";
import {Dispatch, SetStateAction} from "react";

interface ImportSentryAlertModalProps {
	setShowModal: Dispatch<SetStateAction<boolean>>;
	onSuccess: () => void;
}

export function ImportSentryAlertModal({setShowModal, onSuccess}: ImportSentryAlertModalProps) {
	return (
		<div
			className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-30">
			<div className="w-full h-full bg-white opacity-75"/>
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[506px] h-[272px] border border-gray-200 bg-white">
				<div
					className="absolute top-0 right-0 h-16 flex flex-row justify-between items-center text-lg px-6">
					<div className="cursor-pointer z-10" onClick={() => setShowModal(false)}>
						<AiOutlineClose/>
					</div>
				</div>
				<div className="w-full h-full flex flex-col justify-center items-center gap-2">
					<AiFillWarning className="w-16 h-16 text-[#F59E28]"/>
					<p className="text-[15px] font-semibold">
						Are you sure you want to connect a new Sentry Wallet?
					</p>
					<p className="text-[#525252] text-[15px]">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
					</p>

					<div className="flex gap-8 my-4">
						<button
							onClick={() => onSuccess()}
							className="w-fit h-auto text-[15px] text-[#F30919] px-4 py-3 font-semibold"
						>
							Yes, import sentry
						</button>
						<button
							onClick={() => setShowModal(false)}
							className="w-fit h-auto bg-[#F30919] text-[15px] text-white px-4 py-3 font-semibold"
						>
							No, take me back
						</button>
					</div>

				</div>
			</div>
		</div>
	)
}
