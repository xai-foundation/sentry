import {MdVerifiedUser} from "react-icons/md";
import {BiLinkExternal} from "react-icons/bi";

interface BuyFlowBanner {
	quantity: number;
}

export function BuyFlowBanner({quantity}: BuyFlowBanner) {
	return (
		<div className="w-full flex flex-col gap-4 px-6">
			<div className="flex flex-col gap-2 bg-[#DCFCE6] p-6">
					<span className="flex flex-row gap-1 items-center font-semibold">
						<MdVerifiedUser size={22} color={"#38A349"}/> Purchase will be completed on <p
						className="text-[#2A803D]">Xai.games</p>
					</span>
				<p className="text-[15px] text-[#15803D]">
					Clicking the following button will open your browser and you will be redirected to the official
					Xai website to connect your wallet and complete your purchase. This is the official website of
					the Xai Foundation.
				</p>
			</div>

			{/*		CTA		*/}
			<div className="pb-6 font-semibold">
				<button
					onClick={() => {
						window.electron.openExternal(`http://localhost:7555/?quantity=${quantity}`)
					}}
					className={"w-full h-16 flex flex-row justify-center items-center gap-1 bg-[#F30919] text-lg text-white"}
				>
					Confirm purchase <BiLinkExternal/>
				</button>
			</div>
		</div>
	)
}
