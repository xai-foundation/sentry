import {FaCircleCheck} from "react-icons/fa6";
import {AiOutlineClose} from "react-icons/ai";
import {useProvider} from "@/hooks/useProvider";
import {useEffect} from "react";

interface WalletConnectedModalProps {
	txHash: string;
	onClose: () => void;
}

export function WalletDisconnectedModal({txHash, onClose}: WalletConnectedModalProps) {
	const {data: providerData} = useProvider();

	useEffect(() => {

		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = "visible"
		}

	}, []);

	return (
		<div
			className="fixed top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-30">
			<div className="w-full h-full bg-black opacity-75"/>
			<div
				className="fixed top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[692px] h-[200px] bg-black">
				<div
					className="absolute top-0 right-0 h-16 flex flex-row justify-between items-center text-lg px-6">
					<div className="cursor-pointer z-10" onClick={onClose}>
						<AiOutlineClose size={24} color="white"
										className="hover:!text-hornetSting duration-300 ease-in"/>
					</div>
				</div>
				<div
					className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
					<FaCircleCheck color={"#16A34A"} size={32}/>
					<span className="text-2xl font-bold text-white text--center">Wallet un-assigned</span>
					<span className="text-elementalGrey text-[17px] font-medium text-center">Transaction ID:
						<a
							onClick={() => window.electron.openExternal(`${providerData?.blockExplorer}/tx/${txHash}`)}
							className="text-[#F30919] ml-1 cursor-pointer"
						>
							{txHash.slice(0, 10) + "..."}
						</a>
					</span>
				</div>
			</div>
		</div>
	)
}
