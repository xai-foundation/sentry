import {FaCircleCheck} from "react-icons/fa6";

export function WalletConnectedModal() {
	return (
		<div
			className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-30">
			<div className="w-full h-full bg-white opacity-90"/>
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[506px] h-[190px] border border-gray-200 bg-white">
				<div
					className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
					<FaCircleCheck color={"#16A34A"} size={32}/>
					<span className="text-xl font-semibold">Wallet connected</span>
					<span className="text-[15px]">Transaction ID:
						<a
							onClick={() => window.electron.openExternal('http://localhost:7555/')}
							className="text-[#F30919] ml-1 cursor-pointer"
						>
							129019028
						</a>
					</span>
				</div>
			</div>
		</div>
	)
}
