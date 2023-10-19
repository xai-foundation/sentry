import {AiFillWarning, AiOutlineClose} from "react-icons/ai";
import {Dispatch, SetStateAction} from "react";
import {RiKey2Line} from "react-icons/ri";
import {IoMdCloseCircle} from "react-icons/io";

interface ActionsRequiredModalProps {
	setShowModal: Dispatch<SetStateAction<boolean>>;
	setShowBuyModal: Dispatch<SetStateAction<boolean>>;
	setShowViewModal: Dispatch<SetStateAction<boolean>>;
}

export function ActionsRequiredModal({setShowModal, setShowBuyModal, setShowViewModal}: ActionsRequiredModalProps) {

	return (
		<div
			className="absolute top-0 right-0 w-[30rem] h-screen flex flex-col justify-start items-center border border-gray-200 z-20 bg-white">
			<div
				className="absolute top-0 w-full h-16 flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
				<div className="flex flex-row gap-2 items-center">
					<AiFillWarning className="w-7 h-7 text-[#F59E28]"/> <span>Actions required</span>
				</div>
				<div className="cursor-pointer z-10" onClick={() => setShowModal(false)}>
					<AiOutlineClose/>
				</div>
			</div>

			<div className="w-full flex flex-col gap-4 px-6 pt-[5.25rem]">
				<div className="flex flex-col gap-2 bg-[#FFFBEB] p-6">
					<span className="flex flex-row gap-1 items-center font-semibold">
						<IoMdCloseCircle size={22} color={"#F59E28"}/> You do not own a key
					</span>
					<p className="text-[15px] text-[#924012]">
						No Xai Sentry Node Keys found in all added wallets
					</p>

					<div className="pb-2 font-semibold">
						<button
							onClick={() => {
								setShowModal(false);
								setShowBuyModal(true);
							}}
							className={`w-full h-10 flex flex-row justify-center items-center gap-1 bg-[#F30919] text-[15px] text-white`}
						>
							<RiKey2Line className="w-5 h-5"/>
							Purchase keys
						</button>
					</div>

					<p className="text-[15px] text-[#924012]">
						Already own a key?
						<a
							onClick={() => {
								setShowModal(false);
								setShowViewModal(true);
							}}
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
