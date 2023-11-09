import {BiLoaderAlt} from "react-icons/bi";
import {FaCircleCheck} from "react-icons/fa6";
import {useProvider} from "@/features/checkout/hooks/useProvider";

interface WebBuyFlowSuccessProps {
	isLoading: boolean;
	isSuccess: boolean;
	data: any;
}

export function WebBuyFlowSuccess({isLoading, isSuccess, data}: WebBuyFlowSuccessProps) {
	const {data: providerData} = useProvider();

	function returnToClient() {
		window.location = `xai-sentry://purchase-successful?txHash=${data.hash}` as unknown as Location;
	}

	return (
		<>
			{isLoading && !isSuccess ? (
				<div className="w-[744px] h-[208px] flex flex-col justify-center border border-[#E5E5E5] m-4">
					<div className="w-full h-[390px] flex flex-col justify-center items-center gap-2">
						<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
						<p>Processing transaction...</p>
					</div>
				</div>
			) : (
				<div
					className="flex flex-col justify-center items-center w-[744px] h-[320px] border border-gray-200 bg-white m-4">
					<div
						className="flex flex-col justify-center items-center gap-2">
						<FaCircleCheck color={"#16A34A"} size={64}/>
						<span className="text-2xl font-semibold mt-2">Purchase successful</span>
						<span className="text-[15px]">Transaction ID:
						<a
							onClick={() => window.open(`${providerData?.blockExplorer}/tx/${data.hash}`)}
							className="text-[#F30919] ml-1 cursor-pointer"
						>
							{data.hash.slice(0, 10) + "..."}
						</a>
					</span>

						<button
							onClick={() => returnToClient}
							className="w-[436px] bg-[#F30919] text-white p-4 font-semibold mt-8"
						>
							Return to Xai Client
						</button>
					</div>
				</div>
			)}
		</>
	);
}
