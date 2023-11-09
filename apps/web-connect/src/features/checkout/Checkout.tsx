import {WebBuyFlow} from "./WebBuyFlow.js";
import {useState} from "react";
import {MdVerifiedUser} from "react-icons/md";
import {WebBuyFlowSuccess} from "./WebBuyFlowSuccess.js";

export function Checkout() {
	const [purchase, setPurchase] = useState(false);

	return (
		<div>
			<div className="h-screen flex flex-col justify-center items-center">
				<div className="w-[744px] flex flex-col gap-2 bg-[#DCFCE6] p-6">
					<span className="flex flex-row gap-1 items-center font-semibold">
						<MdVerifiedUser size={22} color={"#38A349"}/>You are on the official <p
						className="text-[#2A803D]">Xai.games</p> website
					</span>
					<p className="text-[15px] text-[#15803D]">
						Purchases from Xai will only ever occur on Xai.games. Check that you are on Xai.games whenever
						purchasing from Xai.
					</p>
				</div>

				{purchase
					? <WebBuyFlowSuccess/>
					: <WebBuyFlow setPurchase={setPurchase}/>
				}
			</div>
			<div className="absolute top-0 right-0 p-4">
				<w3m-button/>
			</div>
		</div>
	)
}
