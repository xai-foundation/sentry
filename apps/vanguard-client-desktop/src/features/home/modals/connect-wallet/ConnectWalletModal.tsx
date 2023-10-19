import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {AiOutlineClose} from "react-icons/ai";
import {BiLoaderAlt} from "react-icons/bi";
import {FaCircleCheck} from "react-icons/fa6";

interface ConnectWalletModalProps {
	setShowConnectedModal: Dispatch<SetStateAction<boolean>>;
}

export function ConnectWalletModal({setShowConnectedModal}: ConnectWalletModalProps) {
	const [connectWallet, setConnectWallet] = useState<boolean>(false);

	useEffect(() => {
		// Function to set loading to true after 2 seconds
		const setLoadingTrueAfterDelay = () => {
			setTimeout(() => {
				setConnectWallet(true);
			}, 2000); // 2000 milliseconds (2 seconds)
		};

		// Call the function when the component mounts
		setLoadingTrueAfterDelay();
	}, []);

	return (
		<div
			className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-20">
			<div className="w-full h-full bg-white opacity-70"/>
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[506px] h-[216px] border border-gray-200 bg-white">
				<div
					className="absolute top-0 right-0 h-16 flex flex-row justify-between items-center text-lg px-6">
					<div className="cursor-pointer z-10" onClick={() => setShowConnectedModal(false)}>
						<AiOutlineClose/>
					</div>
				</div>

				{connectWallet ? (
					<div
						className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
						<FaCircleCheck color={"#16A34A"} size={32}/>
						<span className="text-xl font-semibold">Wallet connected</span>
						<span className="text-[15px]">Transaction ID:
						<a
							onClick={() => window.electron.openExternal('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
							className="text-[#F30919] ml-1 cursor-pointer"
						>
							129019028
						</a>
					</span>
					</div>
				) : (
					<div
						className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
						<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
						<span className="text-xl font-semibold">
							Transaction in progress
						</span>
						<span className="text-[15px]">
							Complete transaction in web browser before returning to Xai Client
						</span>
					</div>
				)}
			</div>
		</div>
	)
}
