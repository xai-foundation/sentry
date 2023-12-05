import {MdVerifiedUser} from "react-icons/md";

export function XaiBanner() {
	return (
		<div className="w-[744px] flex flex-col gap-2 bg-[#DCFCE6] p-6">
			<p className="flex flex-row gap-1 items-center font-semibold">
				<MdVerifiedUser size={22} color={"#38A349"}/>You are on the official checkout page for <p
				className="text-[#2A803D]">Xai Sentry Node Keys</p>
			</p>
			<p className="text-[15px] text-[#15803D]">
				This is one of two official ways to purchase Xai Sentry Keys. Your browser's address bar should either
				say <b>localhost:8080</b> or <a className="cursor-pointer"
												href={"https://sentry.xai.games/"}><b>https://sentry.xai.games/ </b></a>any
				time you are purchasing Xai Sentry Keys.
			</p>
		</div>
	)
}
