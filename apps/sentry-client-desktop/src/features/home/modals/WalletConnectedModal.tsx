import {FaCircleCheck} from "react-icons/fa6";
import {AiOutlineClose} from "react-icons/ai";
import {useProvider} from "@/hooks/useProvider";

interface WalletConnectedModalProps {
	txHash: string;
	onClose: () => void;
}

export function WalletConnectedModal({txHash, onClose}: WalletConnectedModalProps) {
	const {data: providerData} = useProvider();

	return (
		<div
			className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-30">
			<div className="w-full h-full bg-white opacity-75"/>
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[506px] h-[190px] border border-gray-200 bg-white">
				<div
					className="absolute top-0 right-0 h-16 flex flex-row justify-between items-center text-lg px-6">
					<div className="cursor-pointer z-10" onClick={onClose}>
						<AiOutlineClose/>
					</div>
				</div>
				<div
					className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
					<FaCircleCheck color={"#16A34A"} size={32}/>
					<span className="text-xl font-semibold text-center">Wallet assigned</span>
					<span className="text-[15px] text-center">Transaction ID:
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
