import {Dispatch, SetStateAction} from "react";

interface ConnectWalletModalProps {
	setShowContinueInBrowserModal: Dispatch<SetStateAction<boolean>>;
}

export function ContinueInBrowserModal({setShowContinueInBrowserModal}: ConnectWalletModalProps) {
	return (
		<div
			className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-30">
			<div className="w-full h-full bg-white opacity-90"/>
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[506px] h-[190px] border border-gray-200 bg-white">
				<div
					className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4 p-6">
						<span className="text-xl font-semibold">
							Transaction in progress
						</span>
					<span className="text-[15px]">
							Complete transaction in web browser before returning to Xai Client
						</span>

					<button
						onClick={() => setShowContinueInBrowserModal(false)}
						className="w-64 h-auto bg-[#F30919] text-sm text-white p-4 uppercase font-semibold"
					>
						Okay
					</button>
				</div>
			</div>
		</div>
	)
}
