import {Dispatch, SetStateAction} from "react";

interface ConnectWalletModalProps {
	setShowContinueInBrowserModal: Dispatch<SetStateAction<boolean>>;
}

export function ContinueInBrowserModal({setShowContinueInBrowserModal}: ConnectWalletModalProps) {
	// const [connectWallet, setConnectWallet] = useState<boolean>(false);
	//
	// useEffect(() => {
	// 	const setLoadingTrueAfterDelay = () => {
	// 		setTimeout(() => {
	// 			setConnectWallet(true);
	// 		}, 4000);
	// 	};
	//
	// 	setLoadingTrueAfterDelay();
	// }, []);

	return (
		<div
			className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-30">
			<div className="w-full h-full bg-white opacity-90"/>
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[506px] h-[190px] border border-gray-200 bg-white">
				{/*{connectWallet ? (*/}
				{/*	<div*/}
				{/*		className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">*/}
				{/*		<FaCircleCheck color={"#16A34A"} size={32}/>*/}
				{/*		<span className="text-xl font-semibold">Wallet connected</span>*/}
				{/*		<span className="text-[15px]">Transaction ID:*/}
				{/*		<a*/}
				{/*			onClick={() => window.electron.openExternal('http://localhost:7555/')}*/}
				{/*			className="text-[#F30919] ml-1 cursor-pointer"*/}
				{/*		>*/}
				{/*			129019028*/}
				{/*		</a>*/}
				{/*	</span>*/}
				{/*	</div>*/}
				{/*) : (*/}
					<div
						className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4 p-6">
						{/*<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>*/}
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
				{/*)}*/}
			</div>
		</div>
	)
}
