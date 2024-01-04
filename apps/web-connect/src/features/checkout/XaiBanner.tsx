import {MdVerifiedUser} from "react-icons/md";

export function XaiBanner() {
	return (
		<div className="w-[744px] flex flex-col gap-2 bg-[#DCFCE6] p-6">
			<div className="flex flex-row gap-1 items-center font-semibold">
				<MdVerifiedUser size={22} color={"#38A349"}/>You are on the official <p
				className="text-[#2A803D]">Xai.games</p> website
			</div>
			<p className="text-[15px] text-[#15803D]">
				Purchases from Xai will only ever occur on Xai.games. Check that you are on Xai.games whenever
				purchasing from Xai.
			</p>
		</div>
	)
}
